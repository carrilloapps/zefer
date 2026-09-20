"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog } from "radix-ui";
import { Keyboard, X } from "lucide-react";
import { useTheme } from "@/app/components/ThemeProvider";
import { useLanguage } from "@/app/components/LanguageProvider";
import type { TranslationKey } from "@/app/lib/i18n";

/**
 * Global keyboard control for the whole site. A single key (no modifier) runs
 * an action when the user is NOT typing in a field; "?" opens this help
 * overlay; Escape closes it. Every action here is also reachable by mouse —
 * this just makes the app fully operable from the keyboard.
 */

type Shortcut = { keys: string[]; descKey: TranslationKey };

const SHORTCUTS: Shortcut[] = [
  { keys: ["?"], descKey: "shortcuts.help" },
  { keys: ["E"], descKey: "shortcuts.encrypt" },
  { keys: ["D"], descKey: "shortcuts.decrypt" },
  { keys: ["G"], descKey: "shortcuts.generator" },
  { keys: ["Z"], descKey: "shortcuts.analyzer" },
  { keys: ["H"], descKey: "shortcuts.home" },
  { keys: ["T"], descKey: "shortcuts.theme" },
  { keys: ["Esc"], descKey: "shortcuts.close" },
];

export default function KeyboardShortcuts() {
  const router = useRouter();
  const { toggleTheme } = useTheme();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      // Never hijack browser/OS combos.
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      // Escape is owned by the Radix dialog while it is open.
      if (e.key === "Escape") return;

      // Don't fire single-key actions while the user is typing.
      const el = document.activeElement as HTMLElement | null;
      const typing =
        !!el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.tagName === "SELECT" ||
          el.isContentEditable);
      if (typing) return;

      const go = (path: string) => {
        setOpen(false);
        router.push(path);
      };

      // "?" is Shift+/ on most layouts, but normalize both forms.
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }

      switch (e.key) {
        case "e":
        case "E":
          // Switch the home tab in place if already there; navigate otherwise.
          window.dispatchEvent(new CustomEvent("zefer:set-tab", { detail: "encrypt" }));
          go("/?t=encrypt");
          break;
        case "d":
        case "D":
          window.dispatchEvent(new CustomEvent("zefer:set-tab", { detail: "decrypt" }));
          go("/?t=decrypt");
          break;
        case "g":
        case "G":
          go("/generator");
          break;
        case "z":
        case "Z":
          go("/analyzer");
          break;
        case "h":
        case "H":
          go("/");
          break;
        case "t":
        case "T":
          setOpen(false);
          toggleTheme();
          break;
      }
    }

    // Let other UI (e.g. the navbar button) open the overlay.
    function onToggle() {
      setOpen((o) => !o);
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("zefer:toggle-shortcuts", onToggle);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("zefer:toggle-shortcuts", onToggle);
    };
  }, [router, toggleTheme]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="shortcuts-overlay fixed inset-0 z-[100]" />
        <Dialog.Content className="shortcuts-panel fixed left-1/2 top-1/2 z-[101] w-[calc(100vw-2rem)] max-w-md p-6 rounded-2xl border border-[var(--glass-border)] shadow-2xl">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl theme-primary-faint theme-primary-border border flex items-center justify-center shrink-0">
              <Keyboard className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <Dialog.Title className="text-sm font-semibold theme-heading">{t("shortcuts.title")}</Dialog.Title>
              <Dialog.Description className="text-xs theme-muted">{t("shortcuts.subtitle")}</Dialog.Description>
            </div>
            <Dialog.Close
              className="w-9 h-9 flex items-center justify-center rounded-lg cursor-pointer theme-faint hover:theme-text transition-colors shrink-0"
              aria-label={t("aria.close")}
            >
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <ul className="space-y-1.5">
            {SHORTCUTS.map((s) => (
              <li key={s.descKey} className="flex items-center justify-between gap-3 py-1">
                <span className="text-[13px] theme-text">{t(s.descKey)}</span>
                <span className="flex gap-1 shrink-0">
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      className="text-primary theme-primary-faint theme-primary-border border rounded-md px-2 py-1 text-[11px] font-mono font-semibold leading-none min-w-[1.75rem] text-center"
                    >
                      {k}
                    </kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] theme-muted mt-4 pt-3 border-t border-[var(--glass-border)]">
            {t("shortcuts.note")}
          </p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
