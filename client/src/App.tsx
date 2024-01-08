import React, { useEffect, useState } from "react";
const API_URL = "http://localhost:8080";

function App() {
  const [data, setData] = useState<string>();
  const [encryptedData, setEncryptedData] = useState<string>();
  const [msg, setMsg] = useState<string>();
  const [token, setToken] = useState<string>();
  useEffect(() => {
    if (!token) {
      showLoginAlertWithUserNameAndPassword();
    } else {
      getData(token);
    }
  }, []);

  const getData = async (token) => {
    console.log("token", token);
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        authorization: "Bearer " + token + "",
      },
    });
    const { data, encryptedData } = await response.json();
    setData(data);
    setEncryptedData(encryptedData);
  };
  const getbackUpData = async () => {
    const response = await fetch(API_URL + "/retrieve-backup-data", {
      method: "GET",
      headers: {
        authorization: "Bearer " + token + "",
      },
    });
    const { data, encryptedData } = await response.json();
    setData(data);
    setMsg(msg);
    setEncryptedData(encryptedData);
  };

  const updateData = async () => {
    const response = await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ data: data, encryptedData : encryptedData }),

      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token + "",
      },
    });
    const { msg , status } = await response.json();
    if (status) {
      await getData(token);
    }
    setMsg(msg);
  };

  const verifyData = async () => {
    const response = await fetch(API_URL + "/verify", {
      method: "POST",
      body: JSON.stringify({ data, encryptedData }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        authorization: "Bearer " + token + "",
      },
    });

    const { msg, status } = await response.json();
    if (!status) {
      setData("");
      setEncryptedData("");
    }
    setMsg(msg);
    alert(msg);
  };
  const showLoginAlertWithUserNameAndPassword = async () => {
    const username = prompt("Enter username");
    const password = prompt("Enter password");
    if (username === "admin" && password === "admin") {
      const response = await fetch(API_URL + "/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      const { token } = await response.json();
      setToken(token);
      getData(token);
      alert("Login Success");
    } else {
      alert("Login Failed");
    }
  };
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        position: "absolute",
        padding: 0,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: "20px",
        fontSize: "30px",
      }}
    >
      <div>Saved Data</div>
      <div>{msg}</div>
      <input
        style={{ fontSize: "30px" }}
        type="text"
        value={data}
        onChange={(e) => setData(e.target.value)}
      />

      <div style={{ display: "flex", gap: "10px" }}>
        <button style={{ fontSize: "20px" }} onClick={updateData}>
          Update Data
        </button>
        <button style={{ fontSize: "20px" }} onClick={verifyData}>
          Verify Data
        </button>
        <button style={{ fontSize: "20px" }} onClick={getbackUpData}>
          {" "}
          Get Data
        </button>
      </div>
    </div>
  );
}

export default App;
