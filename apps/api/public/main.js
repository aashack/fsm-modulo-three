// This was generated with AI for ease of use

const inputEl = document.getElementById("input");
const btn = document.getElementById("btn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

function setStatus(msg, isError = false) {
  statusEl.textContent = msg;
  statusEl.className = isError ? "error" : "muted";
}

function setResult(html) {
  resultEl.innerHTML = html;
}

// Computes the result by sending the input to the server and updating the UI based on the response.
async function compute() {
  const input = inputEl.value.trim();

  setStatus("Computing…");
  setResult("");

  // Send the input to the server and handle the response
  try {
    const res = await fetch("/api/mod3", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ input })
    });

    const data = await res.json();

    if (!res.ok) {
      setStatus(data?.error ?? "Request failed.", true);
      return;
    }

    setStatus("Done.");
    setResult(
      `<div>Remainder: <strong data-testid="remainder">${data.remainder}</strong></div>` +
      `<div>Final state: <strong data-testid="final-state">${data.finalState}</strong></div>`
    );
  } catch (err) {
    setStatus("Network error.", true);
  }
}

btn.addEventListener("click", compute);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") compute();
});
