import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const { url, users } = await req.json();

    if (!url || !users) {
      return NextResponse.json(
        { error: "Parâmetros inválidos. Informe { url, users }" },
        { status: 400 }
      );
    }

    // 🔹 Caminhos temporários
    const scriptPath = path.join("/tmp", `script-${Date.now()}.js`);
    const outputPath = path.join("/tmp", `summary-${Date.now()}.json`);

    const script = `
      import http from 'k6/http';
      import { sleep } from 'k6';

      export let options = {
        vus: ${users},
        duration: '10s',
      };

      export default function () {
        http.get('${url}');
        sleep(1);
      }
    `;

    // 🔹 Cria o script temporário
    await fs.writeFile(scriptPath, script, { mode: 0o644 });

    // 🔹 Executa o k6
    let stdout: string, stderr: string;
    try {
      ({ stdout, stderr } = await execAsync(
        `k6 run ${scriptPath} --summary-export=${outputPath}`
      ));
    } catch (err: any) {
      return NextResponse.json(
        { error: `Erro ao executar k6: ${err.message}` },
        { status: 500 }
      );
    }

    // 🔹 Lê o summary.json
    let summary: any;
    try {
      const raw = await fs.readFile(outputPath, "utf-8");
      summary = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Não foi possível ler o summary do k6" },
        { status: 500 }
      );
    }

    // 🔹 Extrai métricas principais
    const metrics = {
      rps: summary.metrics?.http_reqs?.rate || 0,
      avgLatency: summary.metrics?.http_req_duration?.avg || 0,
      errors: summary.metrics?.http_req_failed?.fails || 0,
    };

    return NextResponse.json({
      output: stdout,
      warnings: stderr || null,
      metrics,
    });
  } catch (e: any) {
    console.error("Erro geral:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
