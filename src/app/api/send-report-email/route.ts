import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface EmailReportRequest {
  to: string;
  parcelleName: string;
  status: "ok" | "vigilance" | "alerte";
  summary: string;
  recommendations: string[];
  nextActions?: { action: string; priority: string; timing?: string }[];
  diseaseRisk?: { level: string; diseases: string[] };
  weather?: { temperature: number; humidity: number; precipitation: number; windSpeed: number };
  reportUrl: string;
}

function statusLabel(status: string) {
  return status === "alerte" ? "Alerte" : status === "vigilance" ? "Vigilance" : "Normal";
}

function statusColor(status: string) {
  return status === "alerte" ? "#dc2626" : status === "vigilance" ? "#ca8a04" : "#166534";
}

function statusBg(status: string) {
  return status === "alerte" ? "#fee2e2" : status === "vigilance" ? "#fef9c3" : "#dcfce7";
}

function riskColor(level: string) {
  return level === "high" ? "#dc2626" : level === "medium" ? "#ca8a04" : "#166534";
}

function buildHtml(data: EmailReportRequest): string {
  const sc = statusColor(data.status);
  const sb = statusBg(data.status);
  const sl = statusLabel(data.status);
  const date = new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  const weatherRows = data.weather ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:16px 0">
      <tr>
        <td style="padding:8px 12px;background:#f9fafb;border-radius:8px;text-align:center;width:25%">
          <div style="font-size:20px;font-weight:700;color:#111827">${data.weather.temperature}°C</div>
          <div style="font-size:11px;color:#6b7280">Température</div>
        </td>
        <td width="8"></td>
        <td style="padding:8px 12px;background:#f9fafb;border-radius:8px;text-align:center;width:25%">
          <div style="font-size:20px;font-weight:700;color:#111827">${data.weather.humidity}%</div>
          <div style="font-size:11px;color:#6b7280">Humidité</div>
        </td>
        <td width="8"></td>
        <td style="padding:8px 12px;background:#f9fafb;border-radius:8px;text-align:center;width:25%">
          <div style="font-size:20px;font-weight:700;color:#111827">${data.weather.precipitation}mm</div>
          <div style="font-size:11px;color:#6b7280">Précipitations</div>
        </td>
        <td width="8"></td>
        <td style="padding:8px 12px;background:#f9fafb;border-radius:8px;text-align:center;width:25%">
          <div style="font-size:20px;font-weight:700;color:#111827">${data.weather.windSpeed}km/h</div>
          <div style="font-size:11px;color:#6b7280">Vent</div>
        </td>
      </tr>
    </table>
  ` : "";

  const diseaseBlock = data.diseaseRisk ? `
    <div style="margin:16px 0;padding:14px 16px;background:${riskColor(data.diseaseRisk.level)}10;border-left:3px solid ${riskColor(data.diseaseRisk.level)};border-radius:0 8px 8px 0">
      <div style="font-size:12px;font-weight:600;color:${riskColor(data.diseaseRisk.level)};margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em">
        Risque phytosanitaire — ${data.diseaseRisk.level === "high" ? "Élevé" : data.diseaseRisk.level === "medium" ? "Modéré" : "Faible"}
      </div>
      ${data.diseaseRisk.diseases.length ? `<div style="font-size:13px;color:#374151">${data.diseaseRisk.diseases.join(" · ")}</div>` : ""}
    </div>
  ` : "";

  const recoList = data.recommendations.length ? `
    <div style="margin:16px 0">
      <div style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">Recommandations IA</div>
      ${data.recommendations.map((r, i) => `
        <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:8px">
          <span style="min-width:22px;height:22px;background:#dcfce7;color:#166534;border-radius:50%;font-size:11px;font-weight:700;display:inline-flex;align-items:center;justify-content:center">${i + 1}</span>
          <span style="font-size:13px;color:#374151;line-height:1.5">${r}</span>
        </div>
      `).join("")}
    </div>
  ` : "";

  const actionsBlock = data.nextActions && data.nextActions.length ? `
    <div style="margin:16px 0">
      <div style="font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:10px">Actions à planifier</div>
      ${data.nextActions.map(a => {
        const pc = a.priority === "high" ? "#dc2626" : a.priority === "medium" ? "#ca8a04" : "#166534";
        const pb = a.priority === "high" ? "#fee2e2" : a.priority === "medium" ? "#fef9c3" : "#dcfce7";
        const pl = a.priority === "high" ? "Urgent" : a.priority === "medium" ? "Moyen" : "Faible";
        return `
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;padding:8px 10px;background:#f9fafb;border-radius:6px">
            <span style="padding:2px 8px;background:${pb};color:${pc};border-radius:20px;font-size:11px;font-weight:600;white-space:nowrap">${pl}</span>
            <span style="font-size:13px;color:#374151;flex:1">${a.action}</span>
            ${a.timing ? `<span style="font-size:11px;color:#9ca3af;white-space:nowrap">${a.timing}</span>` : ""}
          </div>
        `;
      }).join("")}
    </div>
  ` : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Rapport Budoor — ${data.parcelleName}</title></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px">
    <tr><td>
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto">

        <!-- Header -->
        <tr><td style="background:#166534;padding:24px 28px;border-radius:12px 12px 0 0">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:36px;height:36px;background:white;border-radius:8px;display:flex;align-items:center;justify-content:center">
              <div style="width:18px;height:18px;background:#166534;border-radius:3px"></div>
            </div>
            <div>
              <div style="color:white;font-size:18px;font-weight:700">Budoor</div>
              <div style="color:#86efac;font-size:12px">Rapport agricole · ${date}</div>
            </div>
          </div>
        </td></tr>

        <!-- Status bar -->
        <tr><td style="background:${sb};padding:12px 28px;border-bottom:1px solid ${sc}30">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-size:20px;font-weight:700;color:#111827">${data.parcelleName}</div>
            </div>
            <span style="padding:4px 12px;background:white;color:${sc};border:1px solid ${sc}40;border-radius:20px;font-size:13px;font-weight:600">${sl}</span>
          </div>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:white;padding:24px 28px;border-radius:0 0 12px 12px">

          <!-- Summary -->
          <div style="font-size:14px;color:#374151;line-height:1.6;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #f3f4f6">
            ${data.summary}
          </div>

          ${weatherRows}
          ${diseaseBlock}
          ${recoList}
          ${actionsBlock}

          <!-- CTA -->
          <div style="text-align:center;margin-top:24px;padding-top:20px;border-top:1px solid #f3f4f6">
            <a href="${data.reportUrl}" style="display:inline-block;padding:12px 28px;background:#166534;color:white;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600">
              Voir le rapport complet
            </a>
          </div>

        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 0;text-align:center">
          <div style="font-size:11px;color:#9ca3af">
            Budoor · Rapport généré automatiquement par IA<br>
            <a href="${data.reportUrl}" style="color:#9ca3af">Accéder à votre espace</a>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  try {
    const data: EmailReportRequest = await request.json();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({ success: false, error: "RESEND_API_KEY not configured" }, { status: 500 });
    }

    const fromDomain = process.env.RESEND_FROM_EMAIL || "Budoor <onboarding@resend.dev>";
    const statusLabel_ = statusLabel(data.status);

    const { error } = await resend.emails.send({
      from: fromDomain,
      to: [data.to],
      subject: `[${statusLabel_}] Rapport ${data.parcelleName} — ${new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`,
      html: buildHtml(data),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Email send error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
