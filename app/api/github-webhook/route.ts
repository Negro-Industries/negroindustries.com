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
      console.log("📄 Generating AI summary for changelog diff");
      const summary = await generateChangelogSummary(
        diff,
        repoFullName,
        latestCommit.id,
        latestCommit.message,
      );

      console.log("📤 Sending Telegram notification");
      await sendTelegramNotification(summary);

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
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
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

async function generateChangelogSummary(
  diff: string,
  repoName: string,
  commitSha?: string,
  commitMessage?: string,
): Promise<string> {
  try {
    const groq = createGroq({
      apiKey: process.env.GROQ_API_KEY!,
    });

    const { text } = await generateText({
      model: groq("meta-llama/llama-4-maverick-17b-128e-instruct"),
      prompt: `
        Analyze the following CHANGELOG.md diff from the repository "${repoName}" and provide a concise, human-readable summary of the changes.

        Focus on:
        - New features added
        - Bug fixes
        - Breaking changes
        - Important updates or improvements
        - Version changes if mentioned

        Keep the summary under 200 words and use clear, non-technical language when possible.
        Format your response as bullet points if multiple changes are detected.

        Diff:
        ${diff}
      `,
      maxTokens: 300,
    });

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

    let notification = `🔄 *CHANGELOG Update*\n\n`;
    notification += `📁 *Repository:* [${repoName}](${repoUrl})\n`;
    notification += `📄 *File:* [CHANGELOG.md](${changelogUrl})\n`;
    notification += `⏰ *Updated:* ${timestamp}\n`;

    if (commitSha) {
      notification += `🔗 *Commit:* [${
        commitSha.substring(0, 7)
      }](${commitUrl})\n`;
    }

    if (commitMessage) {
      notification += `💬 *Message:* ${commitMessage}\n`;
    }

    notification += `\n📝 *Summary:*\n${text}\n\n`;
    notification +=
      `🔍 [View Full Changelog](${changelogUrl}) | [View Repository](${repoUrl})`;

    return notification;
  } catch (error) {
    console.error("Error generating AI summary:", error);
    const repoUrl = `https://github.com/${repoName}`;
    const changelogUrl = `${repoUrl}/blob/main/CHANGELOG.md`;

    return `🔄 *CHANGELOG Update*\n\n📁 *Repository:* [${repoName}](${repoUrl})\n📄 *File:* [CHANGELOG.md](${changelogUrl})\n\n❌ Could not generate AI summary. Please check the repository for details.\n\n🔍 [View Changelog](${changelogUrl})`;
  }
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
