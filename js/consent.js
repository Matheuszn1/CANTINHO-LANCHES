/* =========================================================
   Gerenciador de consentimento de cookies — LGPD (Lei 13.709/2018)
   Usado em todas as páginas do site.

   Como funciona:
   - Nenhum script de terceiros roda antes do consentimento.
     Scripts opcionais ficam no HTML como:
       <script type="text/plain" data-consent="estatisticas" ...>
     e só são ativados se a categoria for aceita.
   - Categorias: necessarios (sempre ativos), estatisticas e marketing
     (desativados por padrão, sem caixas pré-marcadas).
   - A escolha fica no cookie próprio "cl_consent" (180 dias).
     Depois disso o banner é exibido de novo para renovar a escolha.
   - O usuário pode mudar de ideia a qualquer momento pelo link
     "Preferências de cookies" (qualquer elemento com [data-cookie-prefs]).
   ========================================================= */
(function () {
  "use strict";

  var COOKIE_NOME = "cl_consent";
  var COOKIE_DIAS = 180;
  var VERSAO = 1; // aumente se mudar as categorias/finalidades para pedir consentimento de novo

  /* ---------- Leitura/gravação do cookie de consentimento ---------- */
  function lerConsentimento() {
    var m = document.cookie.match(new RegExp("(?:^|; )" + COOKIE_NOME + "=([^;]*)"));
    if (!m) return null;
    try {
      var c = JSON.parse(decodeURIComponent(m[1]));
      return c && c.v === VERSAO ? c : null;
    } catch (e) { return null; }
  }

  function gravarConsentimento(estatisticas, marketing) {
    var c = { v: VERSAO, estatisticas: !!estatisticas, marketing: !!marketing, data: new Date().toISOString() };
    var expira = new Date(Date.now() + COOKIE_DIAS * 864e5).toUTCString();
    var seguro = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = COOKIE_NOME + "=" + encodeURIComponent(JSON.stringify(c)) +
      "; expires=" + expira + "; path=/; SameSite=Lax" + seguro;
    return c;
  }

  /* Apaga cookies de terceiros já gravados quando o consentimento é revogado */
  function apagarCookies(prefixos) {
    var host = location.hostname;
    var dominios = ["", host, "." + host, "." + host.split(".").slice(-2).join("."), "." + host.split(".").slice(-3).join(".")];
    document.cookie.split("; ").forEach(function (par) {
      var nome = par.split("=")[0];
      var alvo = prefixos.some(function (p) { return nome.indexOf(p) === 0; });
      if (!alvo) return;
      dominios.forEach(function (d) {
        document.cookie = nome + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/" + (d ? "; domain=" + d : "");
      });
    });
  }

  /* ---------- Ativação dos scripts bloqueados ---------- */
  function ativarScripts(categoria) {
    var bloqueados = document.querySelectorAll('script[type="text/plain"][data-consent="' + categoria + '"]');
    Array.prototype.forEach.call(bloqueados, function (antigo) {
      var novo = document.createElement("script");
      Array.prototype.forEach.call(antigo.attributes, function (a) {
        if (a.name !== "type" && a.name !== "data-consent") novo.setAttribute(a.name, a.value);
      });
      if (!antigo.src) novo.text = antigo.text;
      antigo.parentNode.replaceChild(novo, antigo);
    });
  }

  function aplicar(c) {
    if (!c) return;
    if (c.estatisticas) ativarScripts("estatisticas");
    if (c.marketing) ativarScripts("marketing");
    document.dispatchEvent(new CustomEvent("consent:atualizado", { detail: c }));
  }

  /* ---------- Interface (banner + modal) ---------- */
  var bannerHTML =
    '<div class="cookie-banner" id="cookie-banner" role="region" aria-labelledby="cookie-banner-titulo" hidden>' +
      '<h2 id="cookie-banner-titulo" tabindex="-1">Sua privacidade importa</h2>' +
      '<p>Usamos cookies necessários para o site funcionar. Com a sua permissão, também usamos cookies de ' +
      'estatísticas e de marketing/conteúdo de terceiros (como o mapa do Google). Você escolhe. ' +
      'Saiba mais na <a href="cookies.html">Política de Cookies</a> e na <a href="privacidade.html">Política de Privacidade</a>.</p>' +
      '<div class="cookie-acoes">' +
        '<button type="button" class="btn btn--cookie" data-cc="rejeitar">Rejeitar não essenciais</button>' +
        '<button type="button" class="btn btn--contorno" data-cc="personalizar">Personalizar</button>' +
        '<button type="button" class="btn btn--cookie" data-cc="aceitar">Aceitar todos</button>' +
      '</div>' +
    '</div>' +
    '<dialog class="modal" id="cookie-modal" aria-labelledby="cookie-modal-titulo">' +
      '<form method="dialog" class="modal__inner" id="cookie-form">' +
        '<div class="modal__topo">' +
          '<h2 id="cookie-modal-titulo">Preferências de cookies</h2>' +
          '<button type="button" class="modal__fechar" data-cc="fechar" aria-label="Fechar">×</button>' +
        '</div>' +
        '<p>Escolha quais categorias você autoriza. Você pode alterar isso quando quiser pelo link ' +
        '“Preferências de cookies” no rodapé.</p>' +
        '<div class="cat">' +
          '<div class="cat__topo"><strong>Necessários</strong><span class="cat__fixo">Sempre ativos</span></div>' +
          '<p>Essenciais para o site funcionar e para lembrar a sua escolha de cookies. Não podem ser desativados.</p>' +
        '</div>' +
        '<div class="cat">' +
          '<div class="cat__topo"><label for="cc-estatisticas"><strong>Estatísticas</strong></label>' +
            '<span class="switch"><input type="checkbox" id="cc-estatisticas" name="estatisticas"><span class="switch__trilho" aria-hidden="true"></span></span></div>' +
          '<p>Ajudam a entender, de forma agregada, como o site é usado (ex.: Google Analytics), para melhorá-lo.</p>' +
        '</div>' +
        '<div class="cat">' +
          '<div class="cat__topo"><label for="cc-marketing"><strong>Marketing e conteúdo de terceiros</strong></label>' +
            '<span class="switch"><input type="checkbox" id="cc-marketing" name="marketing"><span class="switch__trilho" aria-hidden="true"></span></span></div>' +
          '<p>Permitem exibir o mapa do Google Maps e medir campanhas em redes sociais (ex.: Meta Pixel). Esses serviços podem gravar cookies próprios.</p>' +
        '</div>' +
        '<div class="modal__acoes">' +
          '<button type="button" class="btn btn--cookie" data-cc="rejeitar">Rejeitar não essenciais</button>' +
          '<button type="button" class="btn btn--contorno" data-cc="salvar">Salvar escolhas</button>' +
          '<button type="button" class="btn btn--cookie" data-cc="aceitar">Aceitar todos</button>' +
        '</div>' +
      '</form>' +
    '</dialog>';

  var banner, modal, chkEst, chkMkt, atual;

  function montarUI() {
    var wrap = document.createElement("div");
    wrap.innerHTML = bannerHTML;
    while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
    banner = document.getElementById("cookie-banner");
    modal = document.getElementById("cookie-modal");
    chkEst = document.getElementById("cc-estatisticas");
    chkMkt = document.getElementById("cc-marketing");

    document.body.addEventListener("click", function (e) {
      var alvo = e.target.closest("[data-cc], [data-cookie-prefs]");
      if (!alvo) return;
      if (alvo.hasAttribute("data-cookie-prefs")) { e.preventDefault(); abrirPreferencias(); return; }
      var acao = alvo.getAttribute("data-cc");
      if (acao === "aceitar") salvar(true, true);
      else if (acao === "rejeitar") salvar(false, false);
      else if (acao === "salvar") salvar(chkEst.checked, chkMkt.checked);
      else if (acao === "personalizar") abrirPreferencias();
      else if (acao === "fechar") fecharModal();
    });
  }

  function abrirPreferencias() {
    // Sem consentimento prévio, as caixas começam desmarcadas (nunca pré-marcadas)
    chkEst.checked = !!(atual && atual.estatisticas);
    chkMkt.checked = !!(atual && atual.marketing);
    if (typeof modal.showModal === "function") modal.showModal();
    else modal.setAttribute("open", "");
    chkEst.focus();
  }

  function fecharModal() {
    if (modal.open) { if (typeof modal.close === "function") modal.close(); else modal.removeAttribute("open"); }
  }

  function salvar(est, mkt) {
    var anterior = atual;
    atual = gravarConsentimento(est, mkt);
    banner.hidden = true;
    fecharModal();

    // Se alguma permissão foi retirada, apaga cookies de terceiros e recarrega
    // para garantir que os scripts já carregados parem de rodar.
    var revogou = anterior && ((anterior.estatisticas && !est) || (anterior.marketing && !mkt));
    if (revogou) {
      if (!est) apagarCookies(["_ga", "_gid", "_gat"]);
      if (!mkt) apagarCookies(["_fbp", "_fbc"]);
      location.reload();
      return;
    }
    aplicar(atual);
  }

  /* ---------- API pública ---------- */
  window.CookieConsent = {
    obter: function () { return atual; },
    abrir: function () { abrirPreferencias(); },
    permitido: function (cat) { return cat === "necessarios" || !!(atual && atual[cat]); }
  };

  function iniciar() {
    montarUI();
    atual = lerConsentimento();
    if (atual) aplicar(atual);
    else {
      banner.hidden = false;
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
