export function UnreachablePage({ domain = "margajewelry.in" }: { domain?: string }) {
  return (
    <div
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        padding: "40px 24px",
        boxSizing: "border-box",
      }}
      className="bg-[#202124] text-[#e8eaed]"
    >
      <div style={{ maxWidth: "560px", width: "100%", marginTop: "60px" }}>
        {/* Chrome / Browser style warning icon */}
        <svg
          style={{ width: "48px", height: "48px", fill: "#9aa0a6", marginBottom: "24px" }}
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>

        <h1 style={{ fontSize: "22px", fontWeight: 500, margin: "0 0 16px 0", color: "#e8eaed" }}>
          This site can’t be reached
        </h1>

        <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#9aa0a6", margin: "0 0 20px 0" }}>
          <strong style={{ color: "#e8eaed" }}>{domain}</strong> refused to connect.
        </p>

        <p style={{ fontSize: "14px", lineHeight: 1.6, color: "#9aa0a6", margin: "0 0 8px 0" }}>
          Try:
        </p>
        <ul style={{ margin: "0 0 24px 0", paddingLeft: "20px", color: "#9aa0a6", fontSize: "14px", lineHeight: 1.6 }}>
          <li>Checking the connection</li>
          <li>Checking the proxy and the firewall</li>
        </ul>

        <div
          style={{
            fontSize: "12px",
            color: "#9aa0a6",
            fontFamily: "Menlo, Monaco, Consolas, monospace",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          ERR_CONNECTION_REFUSED
        </div>
      </div>
    </div>
  );
}
