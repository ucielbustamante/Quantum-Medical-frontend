import { PageAdmin } from "./pageAdmin"
import { Card } from "./card"

export function Especialidad() {
    return (
        <PageAdmin>
            <h1 className=' text-center'style={{
                color: 'black',
                marginTop: '40px'
            }}>Especialidad</h1>
            <button className="btn">Agregar Especialidad</button>
            <div className="container mt-4">
                <div className="row justify-content-center g-4">
                    <div className="col-md-3">
                        <Card />
                    </div>
                    
                </div>
            </div>

        </PageAdmin>
    )
}