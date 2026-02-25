async function importPublicKey(pem) {
    const binaryDer = str2ab(
        atob(pem.replace(/-----.*?-----/g, "").replace(/\n/g, ""))
    );

    return crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        false,
        ["encrypt"]
    );
}

function str2ab(str) {
    const buf = new ArrayBuffer(str.length);
    const view = new Uint8Array(buf);
    for (let i = 0; i < str.length; i++) {
        view[i] = str.charCodeAt(i);
    }
    return buf;
}

document.querySelector("form").addEventListener("submit", async (e) => {
    e.preventDefault();
    document.querySelector("#submit").textContent = "Signing in...";
    document.querySelector("#submit").classList.remove('bg-indigo-600');
    document.querySelector("#submit").classList.add('bg-indigo-400');


    const studentId = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch("/publickey.txt");
    const publicKeyPem = await response.text();

    const publicKey = await importPublicKey(publicKeyPem);

    const encrypted = await window.crypto.subtle.encrypt(
        {
            name: "RSA-OAEP"
        },
        publicKey,
        new TextEncoder().encode(JSON.stringify({ studentId, password }))
    );

    const encryptedBase64 = btoa(
        String.fromCharCode(...new Uint8Array(encrypted))
    );

    const signinResponse = await fetch("/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: encryptedBase64 })
    });

    document.querySelector("#submit").textContent = "Sign in";
    document.querySelector("#submit").classList.add('bg-indigo-600');
    document.querySelector("#submit").classList.remove('bg-indigo-400');

    if (!signinResponse.ok) {
        alert("Login failed");
        return;
    }

    const result = await signinResponse.json();

    if (result.success) {
        window.location.href = "/dashboard";
    } else {
        alert("Invalid credentials");
    }
});