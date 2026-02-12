import Page from "../core/page.tsx";
import { ErrorTypes } from "../constants/constants";

class ErrorPage extends Page {
    private errorType: ErrorTypes;

    static TextObject: { [prop: string]: string } = {
        'Error_404': 'Error! The page was not found.',
        'Error_500': 'Error! Server error occurred.'
    };

    constructor(id: string, errorType: ErrorTypes) {
        super(id);
        this.container.classList.add('error-page');
        // Normalize errorType: if key not present, fallback to Error_404
        if (ErrorPage.TextObject[errorType]) {
            this.errorType = errorType as ErrorTypes;
        } else {
            console.warn('ErrorPage: unknown errorType', errorType, '— falling back to Error_404');
            this.errorType = ErrorTypes.Error_404 as ErrorTypes;
        }
        console.log('ErrorPage constructed with errorType=', this.errorType);
    }

    render() {
        const errorMessage = ErrorPage.TextObject[this.errorType] || `Page "${this.container.id}" not found.`;
        const title = this.createHeaderTitle(errorMessage);
        this.container.append(title);
        return this.container;
    }
}

export default ErrorPage;