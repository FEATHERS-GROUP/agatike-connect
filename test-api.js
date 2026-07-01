import fetch from 'node-fetch';

async function run() {
  try {
    const res = await fetch("http://localhost:3000/_serverFn/eyJmaWxlIjoiL3NyYy9hcGkvYm9vay50cz90c3Mtc2VydmVyZm4tc3BsaXQiLCJleHBvcnQiOiJjcmVhdGVQdWJsaWNBZ2F0aWtlQm9va1JlY29yZF9jcmVhdGVTZXJ2ZXJGbl9oYW5kbGVyIn0", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          book_id: "988383c3-62bf-4d53-8806-5d6e5be674ae", // random book id
          record_data: { test: 1 }
        }
      })
    });
    
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Response:", text);
  } catch(e) {
    console.log("Error:", e);
  }
}

run();
