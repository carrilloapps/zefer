/** @vitest-environment jsdom */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { LanguageProvider } from "../LanguageProvider";
import ProjectContent from "../ProjectContent";
import { t } from "@/app/lib/i18n";

/** A full GitHub profile as /api/author returns it. */
const FULL_AUTHOR = {
  login: "carrilloapps",
  name: "José Carrillo",
  avatar: "https://avatars.githubusercontent.com/u/1?v=4",
  bio: "Senior Fullstack Developer",
  company: "@yummysuperapp",
  location: "Caracas, Venezuela",
  blog: "https://carrillo.app",
  twitter: "carrilloapps",
  publicRepos: 42,
  followers: 128,
  following: 7,
  profileUrl: "https://github.com/carrilloapps",
  createdAt: "2014-06-11T00:00:00Z",
};

/** A profile whose optional fields all came back empty. */
const SPARSE_AUTHOR = {
  ...FULL_AUTHOR,
  avatar: "",
  bio: null,
  company: null,
  location: null,
  createdAt: null,
};

const fetchMock = vi.fn();

function mockJson(payload: unknown) {
  fetchMock.mockResolvedValue({ json: () => Promise.resolve(payload) });
}

function renderPage() {
  return render(
    <LanguageProvider>
      <ProjectContent />
    </LanguageProvider>
  );
}

describe("ProjectContent", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the static project sections regardless of the profile fetch", async () => {
    mockJson(FULL_AUTHOR);
    renderPage();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(t("project.title", "en"));
    expect(screen.getByText(t("project.subtitle", "en"))).toBeInTheDocument();
    expect(screen.getByText(t("project.about.desc", "en"))).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "carrilloapps/zefer" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "carrilloapps/zefer-cli" })).toBeInTheDocument();
    for (const k of [
      "project.feat.encryption",
      "project.feat.format",
      "project.feat.security",
      "project.feat.i18n",
      "project.feat.device",
      "project.feat.compliance",
    ] as const) {
      expect(screen.getByText(t(k, "en"))).toBeInTheDocument();
    }
    for (const k of [
      "project.cli.feat.crosscompat",
      "project.cli.feat.tools",
      "project.cli.feat.mcp",
      "project.cli.feat.library",
      "project.cli.feat.binaries",
    ] as const) {
      expect(screen.getByText(t(k, "en"))).toBeInTheDocument();
    }
    await waitFor(() => expect(screen.getByText("42")).toBeInTheDocument());
  });

  it("keeps the heading hierarchy descending", async () => {
    mockJson(FULL_AUTHOR);
    renderPage();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    const h3s = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(h3s).toContain(t("project.cli.install.title", "en"));
    await waitFor(() => expect(h3s.length).toBeGreaterThan(0));
  });

  it("renders the tech stack table row by row", async () => {
    mockJson(FULL_AUTHOR);
    renderPage();
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows).toHaveLength(9);
    expect(rows[0]).toHaveTextContent("Framework");
    expect(rows[0]).toHaveTextContent("Next.js 16.2.7 (React 19)");
    expect(rows[8]).toHaveTextContent("MIT");
    await waitFor(() => expect(screen.getByText("42")).toBeInTheDocument());
  });

  it("shows the placeholder creator card before the profile arrives", () => {
    // A never-settling fetch keeps the component in its loading state.
    fetchMock.mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByRole("heading", { level: 3, name: "José Carrillo" })).toBeInTheDocument();
    expect(screen.getByText("@carrilloapps")).toBeInTheDocument();
    expect(screen.getByText(t("project.creator.desc", "en"))).toBeInTheDocument();
    // No avatar image and no stats until the profile lands.
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.queryByText("repos")).toBeNull();
    expect(screen.queryByText("followers")).toBeNull();
  });

  it("renders the full profile once /api/author resolves", async () => {
    mockJson(FULL_AUTHOR);
    renderPage();
    expect(fetchMock).toHaveBeenCalledWith("/api/author");

    const avatar = await screen.findByRole("img", { name: "José Carrillo" });
    expect(avatar.getAttribute("src")).toContain(encodeURIComponent(FULL_AUTHOR.avatar));
    expect(screen.getByText("Senior Fullstack Developer")).toBeInTheDocument();
    expect(screen.queryByText(t("project.creator.desc", "en"))).toBeNull();
    expect(screen.getByText("Caracas, Venezuela")).toBeInTheDocument();
    expect(screen.getByText("@yummysuperapp")).toBeInTheDocument();
    expect(screen.getByText(`${t("project.creator.since", "en")} 2014`)).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("128")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /128/ }).getAttribute("href")
    ).toBe("https://github.com/carrilloapps?tab=followers");
  });

  it("omits the optional meta fields the profile left empty", async () => {
    mockJson(SPARSE_AUTHOR);
    renderPage();
    await waitFor(() => expect(screen.getByText("42")).toBeInTheDocument());
    // Avatar missing → the User glyph placeholder stays.
    expect(screen.queryByRole("img")).toBeNull();
    // bio/location/company/createdAt missing → fallback copy, no meta chips.
    expect(screen.getByText(t("project.creator.desc", "en"))).toBeInTheDocument();
    expect(screen.queryByText("Caracas, Venezuela")).toBeNull();
    expect(screen.queryByText("@yummysuperapp")).toBeNull();
    expect(screen.queryByText(new RegExp(t("project.creator.since", "en")))).toBeNull();
  });

  it("labels the avatar generically when the profile has no name", async () => {
    mockJson({ ...FULL_AUTHOR, name: "" });
    renderPage();
    expect(await screen.findByRole("img", { name: "Author" })).toBeInTheDocument();
    // The visible name falls back to the hardcoded creator name.
    expect(screen.getByRole("heading", { level: 3, name: "José Carrillo" })).toBeInTheDocument();
  });

  it("falls back to the bundled profile when /api/author fails", async () => {
    fetchMock.mockRejectedValue(new Error("offline"));
    renderPage();
    const avatar = await screen.findByRole("img", { name: "José Carrillo" });
    expect(avatar.getAttribute("src")).toContain(
      encodeURIComponent("https://github.com/carrilloapps.png")
    );
    expect(screen.getByText("Senior Fullstack Developer & Tech Lead")).toBeInTheDocument();
    expect(screen.getByText("@carrilloapps")).toBeInTheDocument();
    // The fallback carries no location/company/createdAt.
    expect(screen.queryByText(new RegExp(t("project.creator.since", "en")))).toBeNull();
    // Stats still render, from the fallback's zeroes.
    expect(screen.getAllByText("0")).toHaveLength(2);
  });

  it("renders internal CLI links without the external-target attributes", async () => {
    mockJson(FULL_AUTHOR);
    renderPage();
    // Scope to the CLI card — the navbar also links to /mcp.
    const card = screen
      .getByRole("heading", { level: 2, name: t("project.cli.title", "en") })
      .closest("div.glass") as HTMLElement;

    const mcp = within(card).getByRole("link", { name: "MCP" });
    expect(mcp).toHaveAttribute("href", "/mcp");
    expect(mcp).not.toHaveAttribute("target");
    expect(mcp).not.toHaveAttribute("rel");

    const npm = within(card).getByRole("link", { name: "npm" });
    expect(npm).toHaveAttribute("href", "https://www.npmjs.com/package/zefer-cli");
    expect(npm).toHaveAttribute("target", "_blank");
    expect(npm).toHaveAttribute("rel", "noopener noreferrer");

    expect(
      within(card).getByRole("link", { name: t("project.cli.links.binaries", "en") })
    ).toHaveAttribute("href", "https://github.com/carrilloapps/zefer-cli/releases/latest");
    expect(within(card).getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      "https://github.com/carrilloapps/zefer-cli"
    );
    await waitFor(() => expect(screen.getByText("42")).toBeInTheDocument());
  });

  it("renders the install snippet and the donate CTA", async () => {
    mockJson(FULL_AUTHOR);
    renderPage();
    const code = Array.from(document.querySelectorAll(".code-block code"), (c) => c.textContent).join("\n");
    expect(code).toContain("npm install -g zefer-cli");
    expect(code).toContain('import { encodeZefer, analyzePassword } from "zefer-cli";');
    expect(screen.getByText(t("project.donate.desc", "en"))).toBeInTheDocument();
    const donate = screen.getAllByRole("link", { name: new RegExp(t("nav.donate", "en")) });
    for (const link of donate) {
      expect(link).toHaveAttribute("href", "https://www.buymeacoffee.com/carrilloapps");
    }
    await waitFor(() => expect(screen.getByText("42")).toBeInTheDocument());
  });
});
