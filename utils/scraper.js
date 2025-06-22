// utils/scraper.js

const { JSDOM } = require('jsdom');


async function buscarLibros(q, idx = '') {
    const baseUrl = 'http://0197.bepe.ar/cgi-bin/koha/opac-search.pl';
    const params = new URLSearchParams({ q, idx });
    const url = `${baseUrl}?${params.toString()}`;


    try {
        const response = await fetch(url);
        const htmlText = await response.text();

        const dom = new JSDOM(htmlText);
        const doc = dom.window.document;

        const filas = doc.querySelectorAll('tbody tr');
        const libros = [];

        filas.forEach(fila => {
            let titulo = fila.querySelector('a.title')?.textContent?.trim() || '';
            let enlace = fila.querySelector('a.title')?.href || '';
            let autor = fila.querySelector('a.author')?.textContent?.trim() || '';
            let publicacion = fila.querySelector('.results_summary.publisher')?.textContent?.replace(/Publicación:/, '').trim() || '';
            let fecha = fila.querySelector('.results_summary.date')?.textContent?.replace(/Fecha:/, '').trim() || '';
            let disponibilidad = fila.querySelector('.results_summary .label + span')?.textContent?.trim() || '';

            // Limpieza de campos
            titulo = titulo.replace(/\s+\/$/, '').replace(/\s+/g, ' ').trim();
            autor = autor.replace(/\s+/g, ' ').trim();
            publicacion = publicacion.replace(/\s+/g, ' ').replace(/[\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
            fecha = fecha.replace(/\s+/g, ' ').trim();
            disponibilidad = disponibilidad.replace(/\s+/g, ' ').replace(/[\n\r]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

            libros.push({
                titulo,
                enlace,
                autor,
                publicacion,
                fecha,
                disponibilidad
            });
        });


        // Extraer paginación
        const paginacionDiv = doc.querySelector('div.pagination.pagination-small.noprint');
        let paginacion = [];
        if (paginacionDiv) {
            const ul = paginacionDiv.querySelector('ul');
            if (ul) {
                const lis = ul.querySelectorAll('li');
                paginacion = Array.from(lis).map(li => {
                    const a = li.querySelector('a');
                    return {
                        pagina: a ? a.textContent.trim() : '',
                        enlace: a && a.hasAttribute('href') ? a.getAttribute('href') : null
                    };
                });
            }
        }


        return { libros, paginacion };
    } catch (error) {
        console.error("[Scraper] Error durante el proceso de scraping:", error);
        throw new Error('No se pudo completar la búsqueda en el catálogo externo.');
    }
}

module.exports = { buscarLibros };