import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { createGroq } from "@ai-sdk/groq";
import {
  GitHubRepository,
  GitHubWebhookPayload,
  RepositoryConfig,
} from "@/lib/types/github-monitor";
import {
  getOrganizationConfig,
  getRepositoryConfig,
  updateRepositoryConfig,
} from "@/lib/storage/github-monitor";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  console.log("🚀 GitHub webhook received");
  console.log("📡 Request headers:", Object.fromEntries(request.headers));

  try {
    // Get the GitHub event type from headers
    const eventType = request.headers.get("X-GitHub-Event");
    const delivery = request.headers.get("X-GitHub-Delivery");

    console.log(
      `🎯 GitHub webhook received - Event: ${eventType}, Delivery: ${delivery}`,
    );

    // Parse the payload
    let payload: GitHubWebhookPayload;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      payload = await request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.text();
      const urlParams = new URLSearchParams(formData);
      const payloadString = urlParams.get("payload");

      if (!payloadString) {
        console.error("❌ No payload found in form data");
        return NextResponse.json({ error: "No payload found" }, {
          status: 400,
        });
      }

      payload = JSON.parse(payloadString);
    } else {
      try {
        payload = await request.json();
      } catch (error) {
        console.error("❌ Failed to parse payload:", error);
        return NextResponse.json({ error: "Invalid payload format" }, {
          status: 400,
        });
      }
    }

    console.log("📦 Webhook payload:", JSON.stringify(payload, null, 2));

    // Handle repository creation in monitored organizations
    if (eventType === "repository" && payload.action === "created") {
      console.log(`🆕 Repository created: ${payload.repository.full_name}`);
      await handleNewRepository(payload.repository);
      return NextResponse.json({
        message: "Repository created, added to monitoring",
      });
    }

    // Only process push events for changelog monitoring
    if (eventType !== "push") {
      console.log(`⏭️ Skipping non-push event: ${eventType}`);
      return NextResponse.json({ message: "OK" });
    }

    const repoFullName = payload.repository.full_name;
    console.log(`🔍 Processing push to repository: ${repoFullName}`);

    const repoConfig = await getRepositoryConfig(repoFullName);
    console.log("📋 Repository config:", repoConfig);

    // Check if repository is from a monitored organization
    if (!repoConfig) {
      console.log(
        `❓ Repository not configured, checking organization: ${payload.repository.owner.login}`,
      );
      const orgConfig = await getOrganizationConfig(
        payload.repository.owner.login,
      );
      console.log("🏢 Organization config:", orgConfig);

      if (orgConfig && orgConfig.enabled) {
        console.log("✅ Auto-adding repository from monitored organization");
        const newRepoConfig: RepositoryConfig = {
          owner: payload.repository.owner.login,
          repo: payload.repository.name,
          enabled: true,
          fromOrg: true,
        };
        await updateRepositoryConfig(repoFullName, newRepoConfig);
        await sendTelegramNotification(
          `🆕 New repository detected and added to monitoring: ${repoFullName}`,
        );
      } else {
        console.log(
          "❌ Repository not monitored and organization not configured",
        );
        return NextResponse.json({ message: "Repository not monitored" });
      }
    }

    const finalRepoConfig = repoConfig ||
      (await getRepositoryConfig(repoFullName));
    if (!finalRepoConfig || !finalRepoConfig.enabled) {
      console.log("❌ Repository not enabled for monitoring");
      return NextResponse.json({
        message: "Repository not enabled for monitoring",
      });
    }

    // Check if CHANGELOG.md was modified
    const commits = payload.commits ||
      (payload.head_commit ? [payload.head_commit] : []);
    console.log(
      `📝 Checking ${commits.length} commits for CHANGELOG.md changes`,
    );

    const changelogModified = commits.some(
      (commit) =>
        commit.modified.includes("CHANGELOG.md") ||
        commit.added.includes("CHANGELOG.md"),
    );

    if (!changelogModified) {
      console.log("⏭️ No CHANGELOG.md changes detected");
      return NextResponse.json({ message: "No CHANGELOG.md changes" });
    }

    console.log("✅ CHANGELOG.md changes detected!");

    // Get the diff for CHANGELOG.md
    const latestCommit = commits[commits.length - 1];
    if (!latestCommit) {
      console.log("❌ No commits found in payload");
      return NextResponse.json({ message: "No commits found" });
    }

    console.log(`🔍 Getting diff for latest commit: ${latestCommit.id}`);
    const diff = await getChangelogDiff(
      finalRepoConfig.owner,
      finalRepoConfig.repo,
      latestCommit.id,
    );

    if (diff) {
      console.log("📄 Generating comprehensive content for changelog diff");
      const content = await generateChangelogContent(
        diff,
        repoFullName,
        latestCommit.id,
        latestCommit.message,
      );

      console.log("📤 Sending comprehensive Telegram notification");
      await sendComprehensiveNotification(content);

      console.log("💾 Storing generated content for web access");
      await storeGeneratedContent(
        repoFullName,
        content,
        latestCommit.id,
        latestCommit.message,
        diff,
      );

      console.log("💾 Updating repository config with latest commit SHA");
      await updateRepositoryConfig(
        repoFullName,
        { ...finalRepoConfig, lastCommitSha: latestCommit.id },
      );
    } else {
      console.log("❌ No changelog diff found");
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Request completed in ${duration}ms`);

    return NextResponse.json({ message: "OK" });
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Request failed after ${duration}ms:`, error);
    return NextResponse.json({ error: "Internal Server Error" }, {
      status: 500,
    });
  }
}

async function handleNewRepository(
  repository: GitHubRepository,
): Promise<void> {
  const orgConfig = await getOrganizationConfig(repository.owner.login);

  if (orgConfig && orgConfig.enabled) {
    if (orgConfig.excludeRepos.includes(repository.name)) {
      return;
    }

    if (repository.private === true && !orgConfig.includePrivate) {
      return;
    }

    const repoConfig: RepositoryConfig = {
      owner: repository.owner.login,
      repo: repository.name,
      enabled: true,
      fromOrg: true,
    };

    await updateRepositoryConfig(repository.full_name, repoConfig);
  }
}

async function getChangelogDiff(
  owner: string,
  repo: string,
  commitSha: string,
): Promise<string | null> {
  try {
    const url =
      `https://api.github.com/repos/${owner}/${repo}/commits/${commitSha}`;

    console.log(`🔍 Fetching changelog diff for ${owner}/${repo}@${commitSha}`);

    const response = await fetch(url, {
      headers: {
        Authorization: `token ${process.env.PERSONAL_GITHUB_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "nextjs-app/1.0",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ GitHub API error for ${owner}/${repo}@${commitSha}:`, {
        status: response.status,
        error: errorText,
      });
      return null;
    }

    const commitData = await response.json() as {
      files: Array<{
        filename: string;
        patch?: string;
      }>;
    };

    const changelogFile = commitData.files.find(
      (file) => file.filename === "CHANGELOG.md",
    );

    if (changelogFile) {
      console.log(
        `✅ Found CHANGELOG.md with ${
          changelogFile.patch?.length || 0
        } characters of diff`,
      );
      return changelogFile.patch || null;
    } else {
      console.log(`❌ No CHANGELOG.md found in commit files`);
      return null;
    }
  } catch (error) {
    console.error(
      `❌ Error getting changelog diff for ${owner}/${repo}@${commitSha}:`,
      error,
    );
    return null;
  }
}

interface ContentGeneration {
  blogPost: {
    title: string;
    description: string;
    body: string;
    tags: string[];
  };
  socialMedia: {
    twitter: string;
    linkedin: string;
    facebook: string;
  };
  telegramSummary: string;
}

async function generateChangelogContent(
  diff: string,
  repoName: string,
  commitSha?: string,
  commitMessage?: string,
): Promise<ContentGeneration> {
  try {
    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY!,
    });

    // Generate comprehensive content
    const { text } = await generateText({
      model: groq("meta-llama/llama-4-maverick-17b-128e-instruct"),
      prompt: `
        Analyze the following CHANGELOG.md diff from the repository "${repoName}" and generate comprehensive content for multiple platforms.

        Create content that includes:
        1. A blog post with engaging title, SEO description, detailed body, and relevant tags
        2. Social media posts optimized for Twitter/X, LinkedIn, and Facebook
        3. A concise Telegram summary

        Focus on:
        - New features added
        - Bug fixes and improvements
        - Breaking changes (if any)
        - Version updates
        - Developer impact and benefits

        Repository context: ${repoName}
        ${commitMessage ? `Commit message: ${commitMessage}` : ""}

        Please respond in this exact JSON format:
        {
          "blogPost": {
            "title": "Engaging blog post title (60-70 characters)",
            "description": "SEO-friendly meta description (150-160 characters)",
            "body": "Detailed blog post body in markdown format (300-500 words)",
            "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"]
          },
          "socialMedia": {
            "twitter": "Twitter/X post with hashtags (under 280 characters)",
            "linkedin": "Professional LinkedIn post (under 1300 characters)",
            "facebook": "Engaging Facebook business page post (under 500 characters)"
          }
        }

        Diff:
        ${diff}
      `,
      maxTokens: 1500,
    });

    // Parse the AI response
    let parsedContent;
    try {
      parsedContent = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Fallback to simple content
      parsedContent = generateFallbackContent(repoName);
    }

    // Generate Telegram summary
    const timestamp = new Date().toLocaleString("en-US", {
      timeZone: "UTC",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });

    const repoUrl = `https://github.com/${repoName}`;
    const changelogUrl = `${repoUrl}/blob/main/CHANGELOG.md`;
    const commitUrl = commitSha ? `${repoUrl}/commit/${commitSha}` : null;

    let telegramSummary = `🔄 *CHANGELOG Update*\n\n`;
    telegramSummary += `📁 *Repository:* [${repoName}](${repoUrl})\n`;
    telegramSummary += `📄 *File:* [CHANGELOG.md](${changelogUrl})\n`;
    telegramSummary += `⏰ *Updated:* ${timestamp}\n`;

    if (commitSha) {
      telegramSummary += `🔗 *Commit:* [${
        commitSha.substring(0, 7)
      }](${commitUrl})\n`;
    }

    if (commitMessage) {
      telegramSummary += `💬 *Message:* ${commitMessage}\n`;
    }

    telegramSummary +=
      `\n📝 *Blog Post Generated:* ${parsedContent.blogPost.title}\n`;
    telegramSummary +=
      `🔗 *Social Media Posts:* Ready for Twitter, LinkedIn & Facebook\n\n`;
    telegramSummary +=
      `📊 *Content Summary:*\n${parsedContent.blogPost.description}\n\n`;
    telegramSummary += `🏷️ *Tags:* ${
      parsedContent.blogPost.tags.join(", ")
    }\n\n`;
    telegramSummary +=
      `🔍 [View Changelog](${changelogUrl}) | [View Repository](${repoUrl})`;

    return {
      blogPost: parsedContent.blogPost,
      socialMedia: parsedContent.socialMedia,
      telegramSummary,
    };
  } catch (error) {
    console.error("Error generating content:", error);
    const repoUrl = `https://github.com/${repoName}`;
    const changelogUrl = `${repoUrl}/blob/main/CHANGELOG.md`;

    const fallbackContent = generateFallbackContent(repoName);
    return {
      blogPost: fallbackContent.blogPost,
      socialMedia: fallbackContent.socialMedia,
      telegramSummary:
        `🔄 *CHANGELOG Update*\n\n📁 *Repository:* [${repoName}](${repoUrl})\n📄 *File:* [CHANGELOG.md](${changelogUrl})\n\n❌ Could not generate content. Please check the repository for details.\n\n🔍 [View Changelog](${changelogUrl})`,
    };
  }
}

function generateFallbackContent(repoName: string) {
  const repoUrl = `https://github.com/${repoName}`;
  const projectName = repoName.split("/")[1] || repoName;

  return {
    blogPost: {
      title: `${projectName} Update: Latest Changes and Improvements`,
      description:
        `Discover the latest updates, bug fixes, and new features in ${projectName}. Stay up-to-date with our development progress.`,
      body:
        `# ${projectName} Update: Latest Changes and Improvements\n\nWe've just released new updates to ${projectName}! Our development team has been working hard to bring you improvements and new features.\n\n## What's New\n\nOur latest changelog includes various updates that enhance the user experience and improve functionality. Check out the [full changelog](${repoUrl}/blob/main/CHANGELOG.md) for detailed information.\n\n## Stay Updated\n\nWe're committed to continuous improvement and regularly update our projects. Follow our [GitHub repository](${repoUrl}) to stay informed about the latest developments.\n\n---\n\n*Want to contribute? Check out our repository and join our growing community of developers!*`,
      tags: ["development", "update", "changelog", "software", "github"],
    },
    socialMedia: {
      twitter:
        `🚀 Just pushed new updates to ${projectName}! Check out the latest improvements and features. #development #coding #opensource ${repoUrl}`,
      linkedin:
        `Exciting news! We've just released new updates to ${projectName}. Our team has been working diligently to enhance functionality and user experience. These updates represent our commitment to continuous improvement and innovation. Check out the full details in our changelog and see how these improvements can benefit your projects. ${repoUrl}`,
      facebook:
        `🎉 New updates are live for ${projectName}! Our development team has implemented several improvements and new features. Visit our GitHub repository to explore the changes and see how they can enhance your experience. We're always working to make our tools better for our community! ${repoUrl}`,
    },
  };
}

async function sendComprehensiveNotification(
  content: ContentGeneration,
): Promise<void> {
  // Send the Telegram summary
  await sendTelegramNotification(content.telegramSummary);

  // Format and send the comprehensive content
  const comprehensiveMessage = formatComprehensiveContent(content);
  await sendTelegramNotification(comprehensiveMessage);
}

async function storeGeneratedContent(
  repository: string,
  content: ContentGeneration,
  commitSha?: string,
  commitMessage?: string,
  sourceDiff?: string,
): Promise<void> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/api/content`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repository,
          commitSha,
          commitMessage,
          blogPost: content.blogPost,
          socialMedia: content.socialMedia,
          telegramSummary: content.telegramSummary,
          sourceDiff,
          generationModel: "meta-llama/llama-4-maverick-17b-128e-instruct",
        }),
      },
    );

    if (!response.ok) {
      console.error("Failed to store content:", await response.text());
    } else {
      console.log("✅ Content stored successfully");
    }
  } catch (error) {
    console.error("❌ Error storing content:", error);
  }
}

function formatComprehensiveContent(content: ContentGeneration): string {
  let message = `📝 *COMPREHENSIVE CONTENT GENERATED*\n\n`;

  // Blog Post Section
  message += `🌐 *BLOG POST*\n`;
  message += `📰 *Title:* ${content.blogPost.title}\n`;
  message += `📋 *Description:* ${content.blogPost.description}\n`;
  message += `🏷️ *Tags:* ${content.blogPost.tags.join(", ")}\n\n`;
  message += `📄 *Body:*\n\`\`\`\n${content.blogPost.body.substring(0, 500)}${
    content.blogPost.body.length > 500 ? "..." : ""
  }\n\`\`\`\n\n`;

  // Social Media Section
  message += `📱 *SOCIAL MEDIA POSTS*\n\n`;

  message +=
    `🐦 *Twitter/X:*\n\`\`\`\n${content.socialMedia.twitter}\n\`\`\`\n\n`;

  message +=
    `💼 *LinkedIn:*\n\`\`\`\n${content.socialMedia.linkedin}\n\`\`\`\n\n`;

  message +=
    `📘 *Facebook:*\n\`\`\`\n${content.socialMedia.facebook}\n\`\`\`\n\n`;

  message += `✨ *Ready to copy and paste!*`;

  return message;
}

async function sendTelegramNotification(message: string): Promise<void> {
  const telegramApiUrl =
    `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;

  const telegramMessage = {
    chat_id: process.env.TELEGRAM_CHAT_ID,
    text: message,
    parse_mode: "Markdown",
  };

  console.log("📤 Sending Telegram message");

  try {
    const response = await fetch(telegramApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "nextjs-app/1.0",
      },
      body: JSON.stringify(telegramMessage),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Telegram API error:", {
        status: response.status,
        error: errorText,
      });

      // Try again without markdown formatting
      const fallbackMessage = {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: message
          .replace(/\*([^*]+)\*/g, "$1")
          .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"),
      };

      const fallbackResponse = await fetch(telegramApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "nextjs-app/1.0",
        },
        body: JSON.stringify(fallbackMessage),
      });

      if (!fallbackResponse.ok) {
        const fallbackErrorText = await fallbackResponse.text();
        console.error("❌ Telegram fallback API error:", {
          status: fallbackResponse.status,
          error: fallbackErrorText,
        });
      } else {
        console.log("✅ Fallback message sent successfully");
      }
    } else {
      console.log("✅ Telegram message sent successfully");
    }
  } catch (error) {
    console.error("❌ Error sending Telegram message:", error);
  }
}
