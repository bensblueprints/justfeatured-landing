const { getStore } = require("@netlify/blobs");
const { Resend } = require("resend");

const resend = new Resend("re_TqppzRWt_LdZL9X1dzPPB4bpS4riMeNHV");
const ADMIN_SECRET = "justfeatured-admin-2026";
const FROM_EMAIL = "JustFeatured <contact@justfeatured.com>";
const ADMIN_EMAIL = "ben@advancedmarketing.co";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-secret",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

function respond(statusCode, body) {
  return { statusCode, headers: cors, body: JSON.stringify(body) };
}

function isAdmin(event) {
  return (event.headers["x-admin-secret"] || event.headers["X-Admin-Secret"]) === ADMIN_SECRET;
}

// ---------------------------------------------------------------------------
// Email templates
// ---------------------------------------------------------------------------

function welcomeEmailHtml(email) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:40px 40px 30px;">
          <h1 style="color:#e94560;margin:0;font-size:28px;letter-spacing:-0.5px;">JustFeatured</h1>
          <p style="color:#a0a0b0;margin:8px 0 0;font-size:14px;">Premium PR Publication Marketplace</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#1a1a2e;margin:0 0 16px;font-size:22px;">Welcome aboard!</h2>
          <p style="color:#4a4a68;line-height:1.7;margin:0 0 20px;font-size:15px;">
            Thanks for subscribing to JustFeatured. You'll be the first to hear about new publication opportunities,
            exclusive deals, and PR tips that actually move the needle.
          </p>
          <p style="color:#4a4a68;line-height:1.7;margin:0 0 20px;font-size:15px;">
            We curate only high-authority publications so your brand gets the visibility it deserves.
          </p>
          <a href="https://justfeatured.com" style="display:inline-block;background:#e94560;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;">Browse Publications</a>
        </td></tr>
        <tr><td style="background:#f9f9fb;padding:24px 40px;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">You're receiving this because ${email} subscribed to JustFeatured. &copy; JustFeatured</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function orderConfirmationHtml(order) {
  const rows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #eee;color:#333;font-size:14px;">${item.name}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #eee;color:#666;font-size:14px;text-align:center;">${item.da || "N/A"}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #eee;color:#666;font-size:14px;text-align:center;">${item.genre || "General"}</td>
      <td style="padding:12px 16px;border-bottom:1px solid #eee;color:#333;font-size:14px;text-align:right;font-weight:600;">$${item.price}</td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tr><td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:40px 40px 30px;">
          <h1 style="color:#e94560;margin:0;font-size:28px;letter-spacing:-0.5px;">JustFeatured</h1>
          <p style="color:#a0a0b0;margin:8px 0 0;font-size:14px;">Order Confirmation</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <h2 style="color:#1a1a2e;margin:0 0 8px;font-size:22px;">Thank you for your order, ${order.name}!</h2>
          <p style="color:#4a4a68;line-height:1.7;margin:0 0 24px;font-size:15px;">
            We've received your order and our team will begin working on your placements shortly.
            You'll receive updates at <strong>${order.email}</strong>${order.phone ? ` or <strong>${order.phone}</strong>` : ''}.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:6px;overflow:hidden;margin-bottom:24px;">
            <tr style="background:#f9f9fb;">
              <th style="padding:12px 16px;text-align:left;font-size:13px;color:#666;font-weight:600;border-bottom:2px solid #eee;">Publication</th>
              <th style="padding:12px 16px;text-align:center;font-size:13px;color:#666;font-weight:600;border-bottom:2px solid #eee;">DA</th>
              <th style="padding:12px 16px;text-align:center;font-size:13px;color:#666;font-weight:600;border-bottom:2px solid #eee;">Genre</th>
              <th style="padding:12px 16px;text-align:right;font-size:13px;color:#666;font-weight:600;border-bottom:2px solid #eee;">Price</th>
            </tr>
            ${rows}
            <tr style="background:#f9f9fb;">
              <td colspan="3" style="padding:14px 16px;font-size:15px;font-weight:700;color:#1a1a2e;">Total</td>
              <td style="padding:14px 16px;text-align:right;font-size:15px;font-weight:700;color:#e94560;">$${order.total}</td>
            </tr>
          </table>

          ${order.notes ? `<p style="color:#4a4a68;line-height:1.7;font-size:14px;background:#f9f9fb;padding:16px;border-radius:6px;border-left:3px solid #e94560;"><strong>Your notes:</strong> ${order.notes}</p>` : ""}

          <h3 style="color:#1a1a2e;margin:24px 0 12px;font-size:16px;">What happens next?</h3>
          <ol style="color:#4a4a68;line-height:2;font-size:14px;padding-left:20px;margin:0;">
            <li>Our editorial team reviews your order</li>
            <li>You submit your article (or we write one for you)</li>
            <li>Article is published on the selected outlets</li>
            <li>You receive live links and a report</li>
          </ol>
        </td></tr>
        <tr><td style="background:#f9f9fb;padding:24px 40px;border-top:1px solid #eee;">
          <p style="color:#999;font-size:12px;margin:0;">Order ID: ${order.key} &bull; &copy; JustFeatured</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function orderNotificationHtml(order) {
  const rows = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;">${item.name}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:center;">${item.da || "N/A"}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:center;">${item.genre || "General"}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:14px;text-align:right;">$${item.price}</td>
    </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#1a1a2e;padding:30px 40px;">
          <h1 style="color:#e94560;margin:0;font-size:22px;">New Order Received</h1>
        </td></tr>
        <tr><td style="padding:30px 40px;">
          <p style="margin:0 0 6px;font-size:14px;color:#666;">Customer</p>
          <p style="margin:0 0 4px;font-size:16px;color:#333;font-weight:600;">${order.name} (${order.email})</p>
          ${order.phone ? `<p style="margin:0 0 16px;font-size:14px;color:#333;">Phone: ${order.phone}</p>` : ''}

          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;overflow:hidden;margin-bottom:20px;">
            <tr style="background:#f5f5f5;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#666;">Publication</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#666;">DA</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#666;">Genre</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;color:#666;">Price</th>
            </tr>
            ${rows}
            <tr style="background:#f5f5f5;">
              <td colspan="3" style="padding:12px;font-weight:700;">Total</td>
              <td style="padding:12px;text-align:right;font-weight:700;color:#e94560;">$${order.total}</td>
            </tr>
          </table>

          ${order.notes ? `<p style="font-size:14px;color:#333;background:#f9f9fb;padding:12px;border-radius:4px;"><strong>Notes:</strong> ${order.notes}</p>` : ""}
          <p style="font-size:12px;color:#999;margin-top:20px;">Order ID: ${order.key} &bull; ${new Date(order.createdAt).toLocaleString()}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function articleSubmissionNotificationHtml(article) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr><td style="background:#1a1a2e;padding:30px 40px;">
          <h1 style="color:#e94560;margin:0;font-size:22px;">New Article Submitted</h1>
        </td></tr>
        <tr><td style="padding:30px 40px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#999;width:120px;">From</td>
              <td style="padding:8px 0;font-size:14px;color:#333;font-weight:600;">${article.name} (${article.email})</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#999;">Publication</td>
              <td style="padding:8px 0;font-size:14px;color:#333;">${article.publication}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#999;">Title</td>
              <td style="padding:8px 0;font-size:14px;color:#333;font-weight:600;">${article.title}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;font-size:13px;color:#999;">Status</td>
              <td style="padding:8px 0;font-size:14px;color:#f0ad4e;font-weight:600;">Pending Review</td>
            </tr>
          </table>

          <div style="background:#f9f9fb;padding:20px;border-radius:6px;border:1px solid #eee;margin-bottom:16px;">
            <p style="margin:0 0 8px;font-size:12px;color:#999;text-transform:uppercase;letter-spacing:0.5px;">Article Content</p>
            <p style="margin:0;font-size:14px;color:#333;line-height:1.7;white-space:pre-wrap;">${article.content ? article.content.substring(0, 500) + (article.content.length > 500 ? "..." : "") : "No content provided"}</p>
          </div>

          ${article.notes ? `<p style="font-size:14px;color:#333;background:#fff8e1;padding:12px;border-radius:4px;border-left:3px solid #f0ad4e;"><strong>Client notes:</strong> ${article.notes}</p>` : ""}
          <p style="font-size:12px;color:#999;margin-top:20px;">Article ID: ${article.key} &bull; ${new Date(article.createdAt).toLocaleString()}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Action handlers
// ---------------------------------------------------------------------------

async function handleSubscribe(body) {
  const { email } = body;
  if (!email) return respond(400, { error: "Email is required" });

  const store = getStore("subscribers");
  const key = email.toLowerCase().replace(/[^a-z0-9@._-]/g, "_");

  await store.setJSON(key, {
    email: email.toLowerCase(),
    subscribedAt: new Date().toISOString(),
  });

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Welcome to JustFeatured - Premium PR Placements",
      html: welcomeEmailHtml(email),
    });
  } catch (err) {
    console.error("Resend welcome email error:", err);
  }

  return respond(200, { success: true, message: "Subscribed successfully" });
}

async function handleCreateOrder(body) {
  const { email, name, items, total, notes } = body;
  if (!email || !name || !items || !items.length) {
    return respond(400, { error: "email, name, and items are required" });
  }

  const store = getStore("orders");
  const key = `order_${Date.now()}`;
  const order = {
    key,
    email,
    name,
    items,
    total: total || items.reduce((sum, i) => sum + (i.price || 0), 0),
    notes: notes || "",
    status: "new",
    createdAt: new Date().toISOString(),
  };

  await store.setJSON(key, order);

  // Notify admin
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New JustFeatured Order - $${order.total} from ${name}`,
      html: orderNotificationHtml(order),
    });
  } catch (err) {
    console.error("Resend admin notification error:", err);
  }

  // Confirm to customer
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: "Your JustFeatured Order Confirmation",
      html: orderConfirmationHtml(order),
    });
  } catch (err) {
    console.error("Resend customer confirmation error:", err);
  }

  return respond(200, { success: true, order_id: key, message: "Order created" });
}

async function handleSubmitArticle(body) {
  const { email, name, publication, title, content, notes } = body;
  if (!email || !name || !publication || !title) {
    return respond(400, { error: "email, name, publication, and title are required" });
  }

  const store = getStore("articles");
  const key = `article_${Date.now()}`;
  const article = {
    key,
    email,
    name,
    publication,
    title,
    content: content || "",
    notes: notes || "",
    status: "pending",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await store.setJSON(key, article);

  // Notify admin
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `New Article Submission - "${title}" for ${publication}`,
      html: articleSubmissionNotificationHtml(article),
    });
  } catch (err) {
    console.error("Resend article notification error:", err);
  }

  return respond(200, { success: true, article_id: key, message: "Article submitted for review" });
}

async function handleUpdateArticle(event, body) {
  if (!isAdmin(event)) return respond(401, { error: "Unauthorized" });

  const { key, status, admin_notes } = body;
  if (!key || !status) return respond(400, { error: "key and status are required" });
  if (!["approved", "rejected"].includes(status)) {
    return respond(400, { error: "status must be 'approved' or 'rejected'" });
  }

  const store = getStore("articles");
  let article;
  try {
    article = await store.get(key, { type: "json" });
  } catch (_) {
    return respond(404, { error: "Article not found" });
  }
  if (!article) return respond(404, { error: "Article not found" });

  article.status = status;
  article.admin_notes = admin_notes || "";
  article.updatedAt = new Date().toISOString();

  await store.setJSON(key, article);

  return respond(200, { success: true, article });
}

async function handleListOrders(event) {
  if (!isAdmin(event)) return respond(401, { error: "Unauthorized" });

  const store = getStore("orders");
  const { blobs } = await store.list();
  const orders = [];
  for (const item of blobs) {
    const data = await store.get(item.key, { type: "json" });
    if (data) orders.push(data);
  }
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return respond(200, { success: true, count: orders.length, orders });
}

async function handleListArticles(event) {
  if (!isAdmin(event)) return respond(401, { error: "Unauthorized" });

  const store = getStore("articles");
  const { blobs } = await store.list();
  const articles = [];
  for (const item of blobs) {
    const data = await store.get(item.key, { type: "json" });
    if (data) articles.push(data);
  }
  articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return respond(200, { success: true, count: articles.length, articles });
}

async function handleListSubscribers(event) {
  if (!isAdmin(event)) return respond(401, { error: "Unauthorized" });

  const store = getStore("subscribers");
  const { blobs } = await store.list();
  const subscribers = [];
  for (const item of blobs) {
    const data = await store.get(item.key, { type: "json" });
    if (data) subscribers.push(data);
  }
  subscribers.sort((a, b) => new Date(b.subscribedAt) - new Date(a.subscribedAt));
  return respond(200, { success: true, count: subscribers.length, subscribers });
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

exports.handler = async function (event, context) {
  // CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const action = body.action;

    switch (action) {
      case "subscribe":
        return await handleSubscribe(body);
      case "create_order":
        return await handleCreateOrder(body);
      case "submit_article":
        return await handleSubmitArticle(body);
      case "update_article":
        return await handleUpdateArticle(event, body);
      case "list_orders":
        return await handleListOrders(event);
      case "list_articles":
        return await handleListArticles(event);
      case "list_subscribers":
        return await handleListSubscribers(event);
      default:
        return respond(400, { error: `Unknown action: ${action}`, available_actions: ["subscribe", "create_order", "submit_article", "update_article", "list_orders", "list_articles", "list_subscribers"] });
    }
  } catch (err) {
    console.error("API error:", err);
    return respond(500, { error: "Internal server error", message: err.message });
  }
};
