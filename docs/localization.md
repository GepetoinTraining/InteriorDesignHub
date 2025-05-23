# Localization

This project uses `i18next` for internationalization (i18n) to support multiple languages. The primary language is Portuguese (Brazil) (`pt-BR`).

## Adding New Translation Keys

1.  **Identify Text:** Find any hardcoded text in the components that needs to be translated.
2.  **Choose a Key:** Create a descriptive key for this text. For example, if the text is "Submit Application", a good key might be `submitApplicationButton`.
3.  **Add to Translation Files:**
    *   Open the Portuguese translation file: `public/locales/pt-BR/translation.json`.
    *   Add the new key and its Portuguese translation:
        ```json
        {
          "loginPageTitle": "Entrar",
          "dashboardTitle": "Painel Principal",
          "submitApplicationButton": "Enviar Inscrição"
        }
        ```
    *   If other languages are supported, add the key and its translation to the respective files (e.g., `public/locales/en/translation.json`).

## Translation Files Location

*   **Portuguese (Brazil):** `public/locales/pt-BR/translation.json`
*   **English:** `public/locales/en/translation.json` (Example, if added)

Each language has its own directory under `public/locales/`. The `translation.json` file within each directory contains the key-value pairs for that language.

## Using Translations in Components

To use translations in a React component:

1.  **Import `useTranslation`:**
    ```javascript
    import { useTranslation } from 'react-i18next';
    ```
2.  **Initialize the Hook:**
    ```javascript
    const { t } = useTranslation();
    ```
3.  **Use the `t` Function:**
    Replace hardcoded strings with `t('yourTranslationKey')`.
    ```javascript
    // Before
    // <button>Submit Application</button>

    // After
    // <button>{t('submitApplicationButton')}</button>
    ```

### Interpolation (Dynamic Values)

If your translation needs to include dynamic values:

1.  **Add Placeholder to Translation File:**
    ```json
    {
      "welcomeMessage": "Bem-vindo, {{userName}}!"
    }
    ```
2.  **Pass Value to `t` Function:**
    ```javascript
    // In your component
    const userName = "Carlos"; // This could come from user data, props, etc.
    // ...
    // <p>{t('welcomeMessage', { userName: userName })}</p>
    // Output: <p>Bem-vindo, Carlos!</p>
    ```

This setup allows for easy management and expansion of localized content within the application.
