export class GenerateUrlUtils {

  // for deployed backend ( always keep it inside the git so that it will connect with deployed bakcend
  private static readonly BASE_URL: string = 'https://krishi-yatra-backend.onrender.com/';

  // with localhost backend (do not push it without commenting it in the Github)
  // private static readonly BASE_URL: string = 'http://localhost:8080/';
    /**
     * Generates the full API URL from an endpoint constant.
     * Example: GenerateUrlUtils.generateUrl(Endpoint.LOGIN_USER)
     *          'http://localhost:8080/api/v1/user/login'
     */
    static generateUrl(endpoint: string): string {
        return `${GenerateUrlUtils.BASE_URL}${endpoint}`;
    }
}
