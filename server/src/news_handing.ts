import axios from 'axios';
import puppeteer from 'puppeteer';
import * as pdfjs from 'pdfjs-dist';

export class news_handling {
    get_news_urls = async (query: string, api_key: string): Promise<string[]> => {
        try {
            const response = await axios.get(`https://api.thenewsapi.com/v1/news/all`, {
                params: {
                    locale: 'us',
                    language: 'en',
                    search: query,
                    api_token: api_key
                }
            });

            if (response.data && response.data.data) {
                // Extract URLs from the response
                const urls = response.data.data.map((item: any) => item.url);
                return urls;
            } else {
                console.log('No data found in the response.');
                return [];
            }
        } catch (err) {
            console.error('Error fetching news URLs:', err);
            return [];
        }
    }

    url_to_pdf = async (url: string, index: number): Promise<string | null> => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            await page.goto(url, {
                waitUntil: 'networkidle2',
            });

            const pdfPath = `output_${index}.pdf`;
            await page.pdf({ path: pdfPath, format: 'a4' });

            await browser.close();
            return pdfPath;
        } catch (err) {
            console.error('Error generating PDF:', err);
            return null;
        }
    }

    pdf_to_txt = async (path: string): Promise<string | null> => {
        try {
            // Load the PDF document
            const doc = await pdfjs.getDocument(path).promise;
            const totalPages = doc.numPages;
            const text = [];

            for (let i = 1; i <= totalPages; i++) {
                const page = await doc.getPage(i);
                const content = await page.getTextContent();

                // Extract the text from the items
                const pageText = content.items.map(item => ('str' in item ? item.str : ''));
                text.push(pageText.join(' '));
            }

            // Join all pages text into a single string
            return text.join(' ');
        } catch (error) {
            console.error('Error extracting text from PDF:', error);
            return null;
        }
    }

    combine_text = async (query: string, api_key: string): Promise<string> => {
        let output_string = '';

        try {
            const urls = await this.get_news_urls(query, api_key);

            if (urls.length === 0) {
                return 'No articles found.';
            }

            // Process all URLs concurrently
            const pdfPromises = urls.map((url, i) => this.url_to_pdf(url, i));
            const pdfPaths = await Promise.all(pdfPromises);

            // Extract text from all PDFs concurrently
            const textPromises = pdfPaths.map((path, i) => path ? this.pdf_to_txt(path) : Promise.resolve(null));
            const texts = await Promise.all(textPromises);

            // Combine all extracted texts
            texts.forEach((text, i) => {
                if (text) {
                    output_string += `Article #${i + 1}'s extracted text: ${text}\n\n`;
                } else {
                    output_string += `Article #${i + 1}: Failed to extract text.\n\n`;
                }
            });
        } catch (err) {
            console.error('Error in combine_text:', err);
        }

        return output_string;
    }
}
