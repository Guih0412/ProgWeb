import { Pagination } from '../types';

interface Props {
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

export function PaginationBar({ pagination, onPageChange }: Props) {
  const { page, totalPages, total } = pagination;

  return (
    <div className="pagination">
      <span className="pagination-info">
        Página {page} de {totalPages} ({total} registros)
      </span>
      <div className="pagination-actions">
        <button type="button" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </button>
        <button type="button" disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Próxima
        </button>
      </div>
    </div>
  );
}
