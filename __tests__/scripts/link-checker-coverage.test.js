const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "../..");
const workflow = fs.readFileSync(
  path.join(root, ".github/workflows/link-check.yml"),
  "utf8"
);

describe("documentation link-check workflow (#44)", () => {
  test("retains Sunday and manually triggered runs", () => {
    expect(workflow).toMatch(/schedule:\s*\n\s*- cron: '0 0 \* \* 0'/);
    expect(workflow).toContain("workflow_dispatch:");
  });

  test("checks security policy, all nested documentation, and GitHub guidance", () => {
    for (const pattern of [
      "README.md",
      "DEVELOPMENT.md",
      "DEPLOYMENT.md",
      "CONTRIBUTING.md",
      "SECURITY.md",
      "'docs/**/*.md'",
      "'.github/**/*.md'",
      "packages/indexer/README.md",
    ]) {
      expect(workflow).toContain(pattern);
    }
  });

  test("fails instead of silently accepting broken links", () => {
    expect(workflow).toMatch(/^\s*fail:\s*true\s*$/m);
    expect(workflow).toContain("--no-progress");
    expect(workflow).toContain("--exclude 'mailto|github.com/.*#'");
  });

  test.each([
    ".github/PR_DOCUMENTATION.md",
    ".github/PULL_REQUEST_TEMPLATE.md",
  ])("%s resolves its PR body documentation link", (filename) => {
    const source = fs.readFileSync(path.join(root, filename), "utf8");
    const target = "../docs/pr-bodies/README.md";
    expect(source).toContain(`](${target})`);
    expect(
      fs.existsSync(path.resolve(root, path.dirname(filename), target))
    ).toBe(true);
  });
});
