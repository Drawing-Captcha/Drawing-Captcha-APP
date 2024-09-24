async function fetchCompanies(){
    try {
        const response = await fetch("/company", {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            return data

        } else {
            throw new Error('Error from server while trying to request the server');
        }
    } catch (error) {
        console.log('Error in getCompanies:', error);
    }
}