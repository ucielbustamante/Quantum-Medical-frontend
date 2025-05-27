import { useState } from "react";
import { PageAdmin } from "./pageAdmin";
import { FormGenerico } from "./formGenerico";
import { Card } from "./card";

export function FindDoctorByEmail() {
  const [email, setEmail] = useState("");
  const [doctor, setDoctor] = useState(null);
  const [error, setError] = useState("");

  const handleBuscar = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:5000/api/doctors/email/${encodeURIComponent(email)}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.data?.message || "Error al buscar doctor");
      }

      const result = await response.json();
      setDoctor(result.data.doctor);
      setError("");
    } catch (err) {
      setError(err.message);
      setDoctor(null);
    }
  };

  const campos = [
    {
      label: "Email del doctor",
      type: "email",
      name: "email",
      value: email,
      onChange: (e) => setEmail(e.target.value)
    }
  ];

  return (
    <PageAdmin>
        <div>
            <FormGenerico 
                campos={campos} 
                onSubmit={handleBuscar} 
                titulo="Buscar doctor por email" 
                botonTexto="Buscar" 
            />

            {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

            {doctor && (
                <div className="container d-flex justify-content-center"style={{ marginTop: "1rem" }}>
                    <Card
                        title={`${doctor.User.name} ${doctor.User.lastname}`}
                        subtitle="Especialidad"
                        content={[
                        `Email: ${doctor.User.email}`,
                        `DNI: ${doctor.User.dni}`,
                        `Matrícula: ${doctor.license_number}`
                        ]}
                        link={{
                        href: `/doctors/${doctor.id}`,
                        text: "Modificar"
                        }}
                    />
                </div>
            )}
        </div>
    </PageAdmin>
  );
}
