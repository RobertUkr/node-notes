const { error } = require("node:console");
const http = require("node:http");
const PORT = process.env.PORT || 3001;

const notes = [];

let nextId = 1;

const server = http.createServer((req, res) => {
  const { method, url } = req;

  const send = (status, data) => {
    res.writeHead(status, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  };

  if (method === "GET" && url === "/health") {
    send(200, { status: "ok" });
    return;
  }

  if (method === "GET" && url.startsWith("/notes")) {
    const parsed = new URL(url, "http://localhost");

    const search = parsed.searchParams.get("search");
    console.log(search);

    if (parsed.pathname !== "/notes") {
      send(404, { error: "Not Found!" });
      return;
    }

    if (search) {
      const filtered = notes.filter((note) =>
        note.text.toLowerCase().includes(search.toLowerCase()),
      );

      send(200, filtered);
    } else {
      send(200, notes);
    }

    return;
  }

  if (method === "POST" && url === "/notes") {
    let body = " ";

    req.on("data", (chunk) => {
      body += chunk;
    });

    req.on("end", () => {
      try {
        const data = JSON.parse(body);

        if (!data.text || data.text.trim() === " ") {
          send(400, { error: "...Text field is required!" });
          return;
        }

        const note = {
          id: nextId,
          text: data.text,
          createdAt: new Date().toISOString,
        };
        notes.push(note);
        nextId++;

        send(201, note);
      } catch (err) {
        send(400, { error: "Not corrected JSON file" });
      }
    });

    return;
  }

  send(404, { error: "Not Found" });
});

server.listen(PORT, () => {
  console.log("Server is working: http://loсalhost:3001");
});
