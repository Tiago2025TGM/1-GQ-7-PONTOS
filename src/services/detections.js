import Parse from "@/lib/parse";

const Detection = Parse.Object.extend("Detection");

export async function getDetections() {
  const user = Parse.User.current();
  if (!user) throw new Error("Usuário não autenticado");

  const query = new Parse.Query(Detection);
  query.equalTo("user", user);
  query.descending("createdAt");
  const results = await query.find();

  return results.map(detectionToPlain);
}

export async function getDetection(id) {
  const query = new Parse.Query(Detection);
  const detection = await query.get(id);
  return detectionToPlain(detection);
}

export async function createDetection(data) {
  const user = Parse.User.current();
  if (!user) throw new Error("Usuário não autenticado");

  const detection = new Detection();
  detection.set("text", data.text);
  detection.set("detectedLanguage", data.languageName);
  detection.set("languageCode", data.languageCode);
  detection.set("reliability", Number(data.reliability));
  detection.set("isReliable", Boolean(data.isReliable));
  detection.set("note", data.note || "");
  detection.set("user", user);

  const acl = new Parse.ACL(user);
  acl.setPublicReadAccess(false);
  detection.setACL(acl);

  const saved = await detection.save();
  return detectionToPlain(saved);
}

export async function updateDetection(id, data) {
  const query = new Parse.Query(Detection);
  const detection = await query.get(id);

  if (data.note !== undefined) detection.set("note", data.note);

  const saved = await detection.save();
  return detectionToPlain(saved);
}

export async function deleteDetection(id) {
  const query = new Parse.Query(Detection);
  const detection = await query.get(id);
  await detection.destroy();
  return true;
}

function detectionToPlain(d) {
  return {
    id: d.id,
    text: d.get("text"),
    detectedLanguage: d.get("detectedLanguage"),
    languageCode: d.get("languageCode"),
    reliability: d.get("reliability"),
    isReliable: d.get("isReliable"),
    note: d.get("note") || "",
    createdAt: d.get("createdAt")?.toISOString?.() || null,
  };
}
