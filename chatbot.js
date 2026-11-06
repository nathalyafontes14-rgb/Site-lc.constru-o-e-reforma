/* Chatbot de primeiro atendimento – LC Construção e Reforma */
(function () {
  const CONTATO = {
    whatsapp: "(14) 99845-4184",
    wa_link: "https://wa.me/5514998454184",
    email: "lc.construcaoereforma@gmail.com"
  };

  // Respostas por assunto. Para adicionar um assunto, inclua um item aqui.
  const ASSUNTOS = [
    { chaves: ["banheiro"], resp: "Fazemos reforma de banheiros completa: piso, revestimento, encanamento e acabamento." },
    { chaves: ["muro"], resp: "Construímos muros de todos os tamanhos, para casas e terrenos." },
    { chaves: ["calcada"], resp: "Fazemos calçadas novas e reparos em calçadas existentes." },
    { chaves: ["telhado", "telha", "goteira"], resp: "Trabalhamos com telhados: construção, troca de telhas e reparos." },
    { chaves: ["porta", "janela"], resp: "Instalamos portas e janelas com acabamento bem feito." },
    { chaves: ["teto", "forro", "gesso"], resp: "Fazemos instalação de tetos. Conte qual tipo você tem em mente." },
    { chaves: ["encana", "vazamento", "cano", "hidraul"], resp: "Fazemos serviços de encanamento, de pequenos reparos a instalações completas." },
    { chaves: ["servico", "fazem", "oferece", "trabalham"], resp: "Nossos serviços:\n• Construção completa de casas\n• Reformas em geral\n• Banheiros\n• Muros e calçadas\n• Telhados\n• Portas, janelas e tetos\n• Encanamento\n• E outros serviços de obra" },
    { chaves: ["equipe", "lucas", "pedreiro", "funcionario", "faz parte"], resp: "A equipe é liderada pelo pedreiro Lucas de Oliveira. O número de profissionais varia conforme o tamanho da obra." },
    { chaves: ["tempo", "anos", "desde", "experiencia", "quando", "existem"], resp: "Lucas trabalha no ramo desde a adolescência, e a empresa foi formalizada como MEI em 2021." },
    { chaves: ["onde", "regiao", "cidade", "ourinhos", "atende"], resp: "Atendemos Ourinhos e região." },
    { chaves: ["orcamento", "preco", "valor", "quanto"], resp: "O valor depende do serviço e do tamanho da obra. Para um orçamento, fale direto com a gente pelo WhatsApp." },
    { chaves: ["casa", "construir", "construcao", "obra nova"], resp: "Construímos casas completas, do início ao fim. A equipe é dimensionada conforme o tamanho da obra." },
    { chaves: ["reforma", "reformar"], resp: "Fazemos reformas em qualquer parte da casa: cozinha, banheiro, quartos, área externa e mais." },
    { chaves: ["quem sao", "empresa", "mei", "lc"], resp: "A LC Construção e Reforma é uma MEI que atende Ourinhos e região com serviços de construção e reforma." }
  ];
  const FIM = ["tchau", "obrigad", "valeu", "so isso", "nada mais", "encerrar", "ate mais", "nao", "so isso"];
  const CHIPS = ["Quais serviços vocês fazem?", "Quem faz parte da equipe?", "Há quanto tempo existem?", "Quero um orçamento"];

  const el = {
    chat: document.getElementById("chat"),
    msgs: document.getElementById("chat-msgs"),
    opcoes: document.getElementById("chat-opcoes"),
    form: document.getElementById("chat-form"),
    input: document.getElementById("chat-input"),
    fab: document.querySelector(".chat-fab")
  };
  let etapa = "inicio"; // inicio -> nome -> ajuda -> conversa
  let nome = "";

  const norm = t => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const saudacao = () => { const h = new Date().getHours(); return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite"; };

  function add(texto, quem, html) {
    const d = document.createElement("div");
    d.className = "msg " + quem;
    if (html) d.innerHTML = texto; else d.textContent = texto;
    el.msgs.appendChild(d);
    el.msgs.scrollTop = el.msgs.scrollHeight;
  }
  function bot(texto, html, atraso) {
    return new Promise(res => setTimeout(() => { add(texto, "bot", html); res(); }, atraso == null ? 450 : atraso));
  }
  function chips(lista) {
    el.opcoes.innerHTML = "";
    (lista || []).forEach(t => {
      const b = document.createElement("button");
      b.type = "button"; b.textContent = t;
      b.onclick = () => enviar(t);
      el.opcoes.appendChild(b);
    });
  }
  function contatos() {
    return "Para mais informações, fale com a gente:\n" +
      "WhatsApp: <a href=\"" + CONTATO.wa_link + "\" target=\"_blank\" rel=\"noopener\">" + CONTATO.whatsapp + "</a>\n" +
      "E-mail: <a href=\"mailto:" + CONTATO.email + "\">" + CONTATO.email + "</a>";
  }

  async function iniciar() {
    etapa = "nome"; nome = ""; el.msgs.innerHTML = "";
    await bot(saudacao() + "! Tudo bem?", false, 200);
    await bot("Qual é o seu nome?");
  }

  async function enviar(texto) {
    texto = texto.trim();
    if (!texto) return;
    add(texto, "eu"); el.input.value = ""; chips([]);

    if (etapa === "nome") {
      nome = texto.replace(/^(meu nome é|meu nome e|me chamo|sou o|sou a|sou)\s+/i, "").split(/\s+/)[0];
      nome = nome.charAt(0).toUpperCase() + nome.slice(1);
      etapa = "ajuda";
      await bot("Prazer, " + nome + "! Como posso ajudar?");
      chips(CHIPS);
      return;
    }

    etapa = "conversa";
    const t = " " + norm(texto) + " ";
    const acha = ASSUNTOS.find(a => a.chaves.some(c => t.includes(c.length < 4 ? " " + c + " " : c)));
    const fim = !acha && FIM.some(f => t.includes(f));

    if (fim) {
      await bot("Foi um prazer, " + nome + "!\n" + contatos(), true);
      return;
    }
    if (acha) {
      await bot(acha.resp);
      await bot("Posso ajudar com mais alguma coisa?");
      chips(["Quero um orçamento", "Não, obrigado"]);
    } else {
      await bot("Não tenho essa informação aqui, mas o Lucas e a equipe podem te responder.\n" + contatos(), true);
      await bot("Posso ajudar com mais alguma coisa?");
    }
  }

  function abrir() { el.chat.hidden = false; el.fab.hidden = true; if (etapa === "inicio") iniciar(); el.input.focus(); }
  function fechar() { el.chat.hidden = true; el.fab.hidden = false; }

  document.querySelectorAll("[data-abrir-chat]").forEach(b => b.addEventListener("click", abrir));
  document.getElementById("chat-fechar").addEventListener("click", fechar);
  el.form.addEventListener("submit", e => { e.preventDefault(); enviar(el.input.value); });
})();
