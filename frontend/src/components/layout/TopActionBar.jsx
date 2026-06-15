import { useState } from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { formatCurrency } from "../../lib/formatters";
import { askAiAssistant } from "../../services/api";
import { AppIcon } from "../ui/AppIcon";

function toneStyles(type) {
  if (type === "critical") return "border-rose-200 bg-rose-50 text-rose-700";
  if (type === "warning") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-sky-200 bg-sky-50 text-sky-700";
}

function Panel({ title, children, onClose, width = "max-w-[420px]" }) {
  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-stone-950/15 backdrop-blur-sm">
      <div className={`h-full w-full ${width} border-l border-stone-200 bg-[#fdfcfc] p-5 shadow-[0_25px_60px_rgba(83,67,51,0.18)]`}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700"
          >
            Close
          </button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function SmartReply({ notifications, user }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: `Hi ${user?.fullName?.split(" ")[0] || "there"}, ask me about spending, savings, budgets, unusual transactions, recurring bills, forecasts, goals, or your financial health.`
    }
  ]);
  const [input, setInput] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);

  async function sendMessage() {
    if (!input.trim()) return;
    const userMessage = input.trim();
    setMessages((current) => [
      ...current,
      { role: "user", text: userMessage }
    ]);
    setInput("");

    setLoadingReply(true);
    try {
      const response = await askAiAssistant({ message: userMessage });
      const detailBits = [];
      if (response.financialHealth?.score) {
        detailBits.push(`Health: ${response.financialHealth.score}/100`);
      }
      if (response.forecast?.projectedEndOfMonth) {
        detailBits.push(`Forecast: ${formatCurrency(response.forecast.projectedEndOfMonth)}`);
      }
      if (response.savingsInsights?.estimatedMonthlySavings) {
        detailBits.push(`Savings opportunity: ${formatCurrency(response.savingsInsights.estimatedMonthlySavings)}`);
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: `${response.answer}${detailBits.length ? `\n\n${detailBits.join(" | ")}` : ""}`
        }
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "Sorry, I couldn't answer that right now."
        }
      ]);
    } finally {
      setLoadingReply(false);
    }
  }

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`max-w-[86%] rounded-[18px] px-4 py-3 text-sm ${
              message.role === "assistant"
                ? "bg-[#faf7f3] text-stone-700"
                : "ml-auto bg-[#ce5c0e] text-white"
            }`}
          >
            {message.text}
          </div>
        ))}
        {loadingReply ? (
          <div className="max-w-[86%] rounded-[18px] bg-[#faf7f3] px-4 py-3 text-sm text-stone-700">
            Thinking...
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-[20px] border border-stone-200 bg-[#faf7f3] p-3">
        <div className="mb-2 flex flex-wrap gap-2">
          {[
            "Where did I spend the most this month?",
            "How can I reduce my expenses?",
            "Show unusual transactions.",
            "Save 50000 in 6 months"
          ].map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => setInput(prompt)}
              className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs text-stone-600"
            >
              {prompt}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") sendMessage();
            }}
            placeholder="Ask the assistant..."
            className="flex-1 rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-800 outline-none"
          />
          <button
            type="button"
            onClick={sendMessage}
            className="rounded-xl bg-[#ce5c0e] px-4 py-2.5 text-sm font-semibold text-white"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export function TopActionBar({ user }) {
  const notifications = useNotifications();
  const [activePanel, setActivePanel] = useState("");

  return (
    <>
      <div className="mb-4 flex items-center justify-end gap-2 rounded-2xl border border-stone-200/80 bg-[#fdfcfc]/80 px-3 py-2 shadow-[0_10px_30px_rgba(83,67,51,0.04)] backdrop-blur">
        <button
          type="button"
          onClick={() => setActivePanel("settings")}
          className="grid h-10 w-10 place-items-center rounded-xl bg-[#f3eee8] text-stone-700"
          title="View settings"
        >
          <AppIcon name="sliders" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("ai")}
          className="grid h-10 w-10 place-items-center rounded-xl bg-[#f3eee8] text-stone-700"
          title="AI chat"
        >
          <AppIcon name="sparkles" className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setActivePanel("notifications")}
          className="relative grid h-10 w-10 place-items-center rounded-xl bg-[#f3eee8] text-stone-700"
          title="Notifications"
        >
          <AppIcon name="bell" className="h-4 w-4" />
          {notifications.unreadCount ? (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-[#ce5c0e] px-1 text-[10px] font-bold text-white">
              {notifications.unreadCount}
            </span>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => {
            if (window.Clerk?.openUserProfile) {
              window.Clerk.openUserProfile();
              return;
            }
            setActivePanel("profile");
          }}
          className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-[#cfe7ef] text-stone-700"
          title="Profile"
        >
          <span className="text-sm font-semibold text-[#2b5667]">
            {(user?.fullName || "U").split(" ").map((part) => part[0]).slice(0, 2).join("")}
          </span>
        </button>
      </div>

      {activePanel === "notifications" ? (
        <Panel title="Notifications" onClose={() => setActivePanel("")}>
          <div className="space-y-3">
            {notifications.items.length ? notifications.items.map((item) => (
              <article key={item.id} className={`rounded-[18px] border p-4 ${toneStyles(item.type)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm opacity-90">{item.message}</p>
                  </div>
                  <span className="rounded-full bg-white/70 px-2 py-1 text-[11px] font-semibold">
                    {item.action}
                  </span>
                </div>
              </article>
            )) : (
              <div className="rounded-[18px] border border-dashed border-stone-300 bg-[#faf7f3] p-5 text-sm text-stone-500">
                No alerts right now.
              </div>
            )}
          </div>
        </Panel>
      ) : null}

      {activePanel === "settings" ? (
        <Panel title="View settings" onClose={() => setActivePanel("")}>
          <div className="space-y-3">
            <div className="rounded-[18px] border border-stone-200 bg-[#faf7f3] p-4 text-sm text-stone-700">
              <p className="font-semibold text-stone-900">Active alert rules</p>
              <div className="mt-3 space-y-2">
                <p>Budget warning uses each budget&apos;s own threshold.</p>
                <p>Low wallet balance alert fires at {formatCurrency(100)}.</p>
                <p>Recurring payment reminders fire at 3, 2, and 1 days before due date.</p>
                <p>Goal deadline reminders fire at 7, 3, and 1 days before target date.</p>
              </div>
            </div>
            <div className="rounded-[18px] border border-stone-200 bg-[#faf7f3] p-4 text-sm text-stone-700">
              <p className="font-semibold text-stone-900">User preferences</p>
              <div className="mt-3 space-y-2">
                <p>Currency: {user?.preferences?.currency || "INR"}</p>
                <p>Income range: {user?.preferences?.incomeRange || "Not set"}</p>
                <p>Focus areas: {(user?.preferences?.focusAreas || []).join(", ") || "Not set"}</p>
              </div>
            </div>
          </div>
        </Panel>
      ) : null}

      {activePanel === "ai" ? (
        <Panel title="AI chat" onClose={() => setActivePanel("")} width="max-w-[460px]">
          <SmartReply notifications={notifications.items} user={user} />
        </Panel>
      ) : null}

      {activePanel === "profile" ? (
        <Panel title="Profile" onClose={() => setActivePanel("")} width="max-w-[420px]">
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-[18px] border border-stone-200 bg-[#faf7f3] p-4">
              <div className="grid h-14 w-14 place-items-center rounded-full bg-[#cfe7ef] text-lg font-semibold text-[#2b5667]">
                {(user?.fullName || "U").split(" ").map((part) => part[0]).slice(0, 2).join("")}
              </div>
              <div>
                <p className="font-semibold text-stone-900">{user?.fullName || "User"}</p>
                <p className="text-sm text-stone-500">{user?.email || "No email available"}</p>
              </div>
            </div>
            <div className="rounded-[18px] border border-stone-200 bg-[#faf7f3] p-4 text-sm text-stone-700">
              <p className="font-semibold text-stone-900">Account summary</p>
              <div className="mt-3 space-y-2">
                <p>Currency: {user?.preferences?.currency || "INR"}</p>
                <p>Income range: {user?.preferences?.incomeRange || "Not set"}</p>
                <p>Focus areas: {(user?.preferences?.focusAreas || []).join(", ") || "Not set"}</p>
                <p>Notes: {user?.preferences?.onboardingNotes || "None"}</p>
              </div>
            </div>
          </div>
        </Panel>
      ) : null}
    </>
  );
}
