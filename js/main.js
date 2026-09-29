/* =========================================================
   Cantinho Lanches e Jantas — interações da página inicial
   ========================================================= */
(function () {
  "use strict";

  /* ---------- CONFIGURAÇÃO ----------
     WhatsApp: preencha só com números, com DDI 55 + DDD + número.
     Ex.: "5548999999999". Deixe vazio ("") se o restaurante não usar WhatsApp:
     nesse caso o botão flutuante vira "Ligar" e os botões de WhatsApp ficam ocultos. */
  var WHATSAPP_NUMERO = ""; // [PREENCHER]
  var WHATSAPP_MENSAGEM = "Olá! Vim pelo site e gostaria de fazer um pedido.";

  document.documentElement.classList.remove("no-js");

  /* ---------- WhatsApp opcional ---------- */
  if (WHATSAPP_NUMERO) {
    var linkWpp = "https://wa.me/" + WHATSAPP_NUMERO + "?text=" + encodeURIComponent(WHATSAPP_MENSAGEM);
    document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
      el.hidden = false;
      if (el.tagName === "A") el.href = linkWpp;
    });
    var flut = document.getElementById("flutuante");
    if (flut) {
      flut.href = linkWpp;
      flut.target = "_blank";
      flut.rel = "noopener";
      flut.classList.add("flutuante--whatsapp");
      flut.setAttribute("aria-label", "Pedir pelo WhatsApp (abre em nova aba)");
      flut.querySelector(".flutuante__texto").textContent = "Pedir no WhatsApp";
      flut.querySelector("svg use").setAttribute("href", "#i-whatsapp");
    }
  }

  /* ---------- Header: fundo sólido ao rolar ---------- */
  var header = document.querySelector(".header");
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 20); }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector(".menu-toggle");
  var nav = document.getElementById("menu-principal");
  function setMenu(aberto) {
    toggle.setAttribute("aria-expanded", String(aberto));
    toggle.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
    nav.classList.toggle("is-open", aberto);
    document.body.style.overflow = aberto ? "hidden" : "";
  }
  toggle.addEventListener("click", function () { setMenu(toggle.getAttribute("aria-expanded") !== "true"); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 960px)").addEventListener("change", function (m) { if (m.matches) setMenu(false); });

  /* ---------- Animação de entrada ao rolar ---------- */
  var reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revelar = document.querySelectorAll(".reveal");
  if (reduzir || !("IntersectionObserver" in window)) {
    revelar.forEach(function (el) { el.classList.add("is-visible"); });
  } else {
    var io = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-visible"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revelar.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Mapa do Google (bloqueado até o consentimento) ----------
     Carrega automaticamente se "Marketing e conteúdo de terceiros" foi aceito,
     ou apenas nesta visita se a pessoa clicar em "Carregar mapa". */
  var mapa = document.getElementById("mapa");
  function carregarMapa() {
    if (!mapa || mapa.querySelector("iframe")) return;
    var iframe = document.createElement("iframe");
    iframe.src = mapa.getAttribute("data-src");
    iframe.title = "Mapa: Cantinho Lanches e Jantas, R. Bruno Mallmann, 6000, Ponta de Baixo, São José - SC";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    iframe.allowFullscreen = true;
    mapa.appendChild(iframe);
    var ph = mapa.querySelector(".mapa__placeholder");
    if (ph) ph.remove();
  }
  document.querySelectorAll("[data-carregar-mapa]").forEach(function (b) { b.addEventListener("click", carregarMapa); });
  document.addEventListener("consent:atualizado", function (e) { if (e.detail && e.detail.marketing) carregarMapa(); });
  if (window.CookieConsent && window.CookieConsent.permitido("marketing")) carregarMapa();

  /* ---------- Ano no rodapé ---------- */
  var ano = document.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
