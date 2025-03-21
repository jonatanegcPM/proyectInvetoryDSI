"use client"; 

import { useEffect, useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const [message, setMessage] = useState(""); 

  
  const fetchData = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "usertest",
          password: "mypassword",
        }),
      });

      if (!response.ok) {
        throw new Error("Error en la solicitud");
      }

      const data = await response.json();
      setMessage(`Respuesta del backend: ${JSON.stringify(data)}`);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(`Error: ${error.message}`);
      } else {
        setMessage("Error desconocido");
      }
    }
  };


  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className={styles.main}>
      <h1>Hello World</h1>
      <p>{message}</p> {}
    </main>
  );
}