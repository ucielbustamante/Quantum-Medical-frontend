import { useState } from "react";
import { apiRequest} from "../services/apiConection"
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
      const token = localStorage.getItem("token");
      const result = await apiRequest(`/doctors/email/${encodeURIComponent(email)}`, "GET", null, token);
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
