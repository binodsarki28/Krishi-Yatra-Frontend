export class GenerateUrlUtils {
    private static readonly BASE_URL: string = 'http://localhost:8080/';

    /**
     * Generates the full API URL from an endpoint constant.
     * Example: GenerateUrlUtils.generateUrl(Endpoint.LOGIN_USER)
     *          'http://localhost:8080/api/v1/user/login'
     */
    static generateUrl(endpoint: string): string {
        return `${GenerateUrlUtils.BASE_URL}${endpoint}`;
    }
}
