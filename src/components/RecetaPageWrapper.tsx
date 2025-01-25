import { useNavigate, useParams } from 'react-router-dom';
import RecetaPage from '../pages/RecetaPage';
import { useEffect } from 'react';

const RecetaPageWrapper = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!id) {
            navigate('/managerecipes');
        }
    }, [id, navigate]);

    console.log("ID en wrapper:", id);
    
    if (!id) return null;
    
    return <RecetaPage mode="edit" recetaId={Number(id)} />;
};

export default RecetaPageWrapper;