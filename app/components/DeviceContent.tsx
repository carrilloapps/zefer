"use client";

import { useEffect, useState } from "react";
import {
  Cpu,
  Monitor,
  Smartphone,
  Gauge,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { analyzeDevice, formatBytes, type DeviceLimits } from "@/app/lib/device";
import { benchmarkDevice } from "@/app/lib/crypto";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function DeviceContent() {
  const { t } = useLanguage();
  const [limits, setLimits] = useState<DeviceLimits | null>(null);
  const [benchmark, setBenchmark] = useState<number | null>(null);

  useEffect(() => {
    setLimits(analyzeDevice());
    benchmarkDevice().then(setBenchmark).catch(() => {});
  }, []);

  if (!limits) return null;
  const { profile } = limits;

  return (
    <main className="flex-1 flex flex-col">
      <Navbar />

      <section className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 glass px-4 py-1.5 mb-6 !rounded-full">
              <Cpu className="w-3 h-3 text-primary" />
              <span className="text-[11px] font-medium text-primary font-mono tracking-wider">
                {t("devicepage.badge")}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold theme-heading mb-4 tracking-tight">
              {t("devicepage.title")}
            </h1>
            <p className="text-base theme-muted max-w-2xl mx-auto leading-relaxed">
              {t("devicepage.subtitle")}
            </p>
          </div>

          {/* Live detection results */}
          <div className="glass glow-green p-6 sm:p-8 mb-6 animate-in">
            <h2 className="text-sm font-semibold theme-heading mb-4 flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" />
              {t("devicepage.your")}
            </h2>

            <div className="glass !rounded-xl overflow-hidden mb-4">
              <table className="w-full">
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {([
                    ["CPU Cores", `${profile.cores}`],
                    ["CPU Architecture", profile.cpuArch],
                    [`RAM (${t("devicepage.reported")})`, profile.ram > 0 ? `${profile.ram} GB` : null],
                    ["GPU Renderer", profile.gpu],
                    ["GPU Vendor", profile.gpuVendor],
                    [t("device.type"), profile.mobile ? "Mobile" : "Desktop"],
                    [t("devicepage.platform"), profile.platform],
                    ["User Agent", profile.userAgent || null],
                    ["JS Heap Limit", profile.heapLimit ? formatBytes(profile.heapLimit) : null],
                    [`JS Heap (${t("devicepage.used")})`, profile.heapUsed ? formatBytes(profile.heapUsed) : null],
                    ["JS Heap Total", profile.heapTotal ? formatBytes(profile.heapTotal) : null],
                    ["PBKDF2 (100k iter.)", benchmark !== null ? `${benchmark.toFixed(0)} ms` : null],
                  ] as [string, string | null][]).map(([label, value]) => (
                    <tr key={label}>
                      <td className="text-xs theme-muted px-4 py-3 whitespace-nowrap align-top">{label}</td>
                      <td className="text-xs font-mono theme-heading px-4 py-3 text-right break-all">
                        {value || <span className="theme-warning">N/A</span>}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-[var(--glass-bg)]">
                    <td className="text-xs font-medium text-primary px-4 py-3">{t("devicepage.maxfile")}</td>
                    <td className="text-sm font-mono font-bold text-primary px-4 py-3 text-right">{limits.maxFileSizeLabel}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* How the calculation works */}
          <div className="glass p-6 sm:p-8 mb-6">
            <h2 className="text-sm font-semibold theme-heading mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              {t("devicepage.formula.title")}
            </h2>
            <div className="glass !rounded-xl p-4 mb-4 font-mono text-xs theme-muted leading-relaxed">
              <p>heapLimit = performance.memory.jsHeapSizeLimit</p>
              <p>available = heapLimit &times; 50%</p>
              <p>maxFile = (available &divide; 3) &times; 80%</p>
            </div>
            <p className="text-[13px] theme-muted leading-relaxed">{t("devicepage.formula.desc")}</p>
          </div>

          {/* Data sources table */}
          <div className="glass p-6 sm:p-8 mb-6">
            <h2 className="text-sm font-semibold theme-heading mb-4">{t("devicepage.sources.title")}</h2>
            <div className="glass !rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--glass-border)]">
                    <th className="text-[10px] font-mono theme-faint uppercase tracking-wider px-4 py-2 text-left">API</th>
                    <th className="text-[10px] font-mono theme-faint uppercase tracking-wider px-4 py-2 text-left">{t("devicepage.sources.browser")}</th>
                    <th className="text-[10px] font-mono theme-faint uppercase tracking-wider px-4 py-2 text-left">{t("devicepage.sources.data")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                  <tr>
                    <td className="text-[11px] font-mono theme-heading px-4 py-2.5">performance.memory</td>
                    <td className="text-[11px] theme-muted px-4 py-2.5">Chrome, Edge</td>
                    <td className="text-[11px] theme-muted px-4 py-2.5">{t("devicepage.sources.heap")}</td>
                  </tr>
                  <tr>
                    <td className="text-[11px] font-mono theme-heading px-4 py-2.5">navigator.deviceMemory</td>
                    <td className="text-[11px] theme-muted px-4 py-2.5">Chrome, Edge, Opera</td>
                    <td className="text-[11px] theme-muted px-4 py-2.5">{t("devicepage.sources.ram")}</td>
                  </tr>
                  <tr>
                    <td className="text-[11px] font-mono theme-heading px-4 py-2.5">navigator.hardwareConcurrency</td>
                    <td className="text-[11px] theme-muted px-4 py-2.5">{t("devicepage.sources.all")}</td>
                    <td className="text-[11px] theme-muted px-4 py-2.5">{t("devicepage.sources.cores")}</td>
                  </tr>
                  <tr>
                    <td className="text-[11px] font-mono theme-heading px-4 py-2.5">WEBGL_debug_renderer_info</td>
                    <td className="text-[11px] theme-muted px-4 py-2.5">{t("devicepage.sources.most")}</td>
                    <td className="text-[11px] theme-muted px-4 py-2.5">{t("devicepage.sources.gpu")}</td>
                  </tr>
                  <tr>
                    <td className="text-[11px] font-mono theme-heading px-4 py-2.5">crypto.subtle.deriveBits</td>
                    <td className="text-[11px] theme-muted px-4 py-2.5">{t("devicepage.sources.all")}</td>
                    <td className="text-[11px] theme-muted px-4 py-2.5">{t("devicepage.sources.bench")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Browser optimization tips */}
          <div className="glass p-6 sm:p-8 mb-6">
            <h2 className="text-sm font-semibold theme-heading mb-4">{t("devicepage.optimize.title")}</h2>
            <div className="space-y-3">
              {[
                { title: "Chrome / Edge", tips: "devicepage.optimize.chrome" },
                { title: "Firefox", tips: "devicepage.optimize.firefox" },
                { title: "Safari", tips: "devicepage.optimize.safari" },
                { title: t("devicepage.optimize.general.title"), tips: "devicepage.optimize.general" },
              ].map((browser) => (
                <div key={browser.title} className="glass glass-hover !rounded-xl p-4 transition-all duration-300">
                  <h3 className="text-xs font-semibold theme-heading mb-2">{browser.title}</h3>
                  <ul className="space-y-1.5">
                    {t(browser.tips as Parameters<typeof t>[0]).split("|").map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] theme-muted">
                        <CheckCircle2 className="w-3 h-3 text-primary shrink-0 mt-0.5" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Why N/A appears */}
          <div className="glass p-6 sm:p-8 mb-6">
            <h2 className="text-sm font-semibold theme-heading mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 theme-warning" />
              {t("devicepage.na.title")}
            </h2>
            <p className="text-[13px] theme-muted leading-relaxed">{t("devicepage.na.desc")}</p>
          </div>

          {/* CTA */}
          <div className="text-center">
            <a href="/" className="btn-primary !w-auto inline-flex px-8">
              {t("how.cta")} <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
