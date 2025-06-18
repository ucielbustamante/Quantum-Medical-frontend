import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/card';
import { PagePatients } from '../components/pagePatients';
import { clinicalRecordService } from '../services/clinicalRecordService';

const PatientClinicalRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchRecords();
  }, [currentPage, searchTerm]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError('');

      const searchParams = {
        limit,
        offset: (currentPage - 1) * limit
      };

      if (searchTerm.trim()) {
        searchParams.title = searchTerm;
      }

      const response = await clinicalRecordService.getMyClinicalRecords();
      setRecords(response.data.records || []);
      setTotalRecords(response.data.total || 0);
    } catch (err) {
      console.error('Error al cargar registros clínicos:', err);
      setError('Error al cargar los registros clínicos');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(totalRecords / limit);

  return (
    <PagePatients>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>Mis Registros Clínicos</h1>
          <Link to="/patient/dashboard">
            <button className="btn btn-secondary">
              Volver al Dashboard
            </button>
          </Link>
        </div>

        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="row mb-3">
          <div className="col-md-6">
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por título..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button className="btn btn-outline-secondary" type="submit">
                  Buscar
                </button>
              </div>
            </form>
          </div>
        </div>

        {loading ? (
          <div className="text-center">
            <p>Cargando registros clínicos...</p>
          </div>
        ) : records.length > 0 ? (
          <>
            <div className="row">
              {records.map((record) => (
                <div key={record.id} className="col-md-6 col-lg-4 mb-3">
                  <Card
                    title={record.title}
                    subtitle={`Creado: ${formatDate(record.createdAt)}`}
                    content={[
                      `Actualizado: ${formatDate(record.updatedAt)}`,
                      `Contenido: ${record.body.substring(0, 100)}${record.body.length > 100 ? '...' : ''}`
                    ]}
                    links={[
                      { href: `/patient/clinical-records/${record.id}`, text: 'Ver Detalles' }
                    ]}
                  />
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-4">
                <nav>
                  <ul className="pagination">
                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </button>
                    </li>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </button>
                      </li>
                    ))}
                    
                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}

            <div className="text-center mt-3">
              <small className="text-muted">
                Mostrando {records.length} de {totalRecords} registros
              </small>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p>No se encontraron registros clínicos.</p>
            <p className="text-muted">Los registros clínicos serán creados por los médicos durante las consultas.</p>
          </div>
        )}
      </div>
    </PagePatients>
  );
};

export default PatientClinicalRecords; 