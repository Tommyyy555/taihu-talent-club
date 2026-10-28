const PLATFORM_CONFIG = Object.freeze({
  apiBaseUrl: "", // 生产环境填入后端地址，例如 https://api.example.com
  modelProvider: "provider-adapter", // 由后端适配层决定真实模型供应商
  demoTokenBudget: 120000,
  publicMode: true,
});

const modal = document.querySelector("#modal");
const modalDialog = modal.querySelector(".modal");
const modalTitle = document.querySelector("#modal-title");
const modalKicker = document.querySelector("#modal-kicker");
const modalDescription = document.querySelector("#modal-description");
const leadForm = document.querySelector("#lead-form");

const modalCopy = {
  experience: {
    kicker: "AI专家入口",
    title: "进入管理者AI陪练体验",
    description: "这是一个无真实专家内容的交互样板。下一步可以接入专家知识库、会话计费和企业授权策略。",
  },
  diagnosis: {
    kicker: "企业服务入口",
    title: "预约一次企业人才诊断",
    description: "留下联系方式和关注方向，我们会把需求记录为待跟进线索。后续可替换为CRM、企业微信或表单接口。",
  },
  partner: {
    kicker: "合作网络",
    title: "申请成为平台伙伴",
    description: "适合人力资源机构、产业园、商协会、培训机构和专业服务商。你带来客户关系，我们提供专家方法与AI产品化能力。",
  },
  login: {
    kicker: "账号与权限",
    title: "登录平台控制台",
    description: "当前为控制台预览。正式版将接入多租户账号、角色权限、邀请机制、审计日志与用量账单。",
  },
};

function openModal(type = "diagnosis") {
  const copy = modalCopy[type] || modalCopy.diagnosis;
  modalKicker.textContent = copy.kicker;
  modalTitle.textContent = copy.title;
  modalDescription.textContent = copy.description;
  modalDialog.classList.remove("is-success");
  leadForm.reset();
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  window.setTimeout(() => modal.querySelector("input")?.focus(), 80);
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;
  const action = actionTarget.dataset.action;
  if (action === "close-modal") closeModal();
  if (["experience", "diagnosis", "partner", "login"].includes(action)) openModal(action);
});

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
});

leadForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = Object.fromEntries(new FormData(leadForm).entries());
  const leads = JSON.parse(localStorage.getItem("taihu-demo-leads") || "[]");
  leads.push({ ...formData, createdAt: new Date().toISOString(), source: "platform-mvp" });
  localStorage.setItem("taihu-demo-leads", JSON.stringify(leads));
  modalDialog.classList.add("is-success");
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

// 后续接入大模型时只替换这个适配器，不把密钥放在浏览器端。
window.TaihuPlatform = {
  config: PLATFORM_CONFIG,
  async createConversation({ expertId, tenantId, message }) {
    if (!PLATFORM_CONFIG.apiBaseUrl) {
      return { mode: "demo", expertId, tenantId, message, reply: "这是平台体验回复。接入后端模型适配器后，这里将返回真实专家知识库回答。" };
    }
    const response = await fetch(`${PLATFORM_CONFIG.apiBaseUrl}/v1/conversations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ expertId, tenantId, message }),
    });
    if (!response.ok) throw new Error("conversation_request_failed");
    return response.json();
  },
};
