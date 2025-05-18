import { PageAdmin } from "./pageAdmin"
import { Card } from "./card"

export function Turnos () {
    return(
        <PageAdmin>
            <h1 className=' text-center'style={{
                color: 'white',
                marginTop: '40px'
            }}>Turnos</h1>
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