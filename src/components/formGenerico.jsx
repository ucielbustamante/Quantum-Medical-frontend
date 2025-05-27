import styles from "../styles/formsGeneral.module.css"

export function FormGenerico({ campos, onSubmit, titulo, botonTexto = "Guardar" }) {
    return (
        <form onSubmit={onSubmit} className={styles.container}>
            <h2 style={{ marginBottom: '1rem' }}>{titulo}</h2>

            <div className={styles.form}>
                {campos.map((campo, index) => (
                    <div key={index} style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
                            {campo.label}
                        </label>

                        {campo.opciones ? (
                            <select
                                name={campo.name}
                                value={campo.value}
                                onChange={campo.onChange}
                                className={styles.select}
                            >

                                <option value="">Seleccionar</option>
                                {campo.opciones.map((opcion, i) => (
                                    <option key={i} value={opcion}>
                                        {opcion}
                                    </option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type={campo.type}
                                name={campo.name}
                                value={campo.value}
                                onChange={campo.onChange}
                                className={styles.input}
                            />
                        )}
                    </div>
                ))}
            </div>

            <button type="submit" className={`btn btn-primary ${styles.submitButton}`}>{botonTexto}</button>
        </form>
    )
}