import type { CloudPage, PageComponent } from './types';

const renderComponent = (component: PageComponent): string => {
  switch (component.type) {
    case 'Header':
      return `
        <header style="background-color: var(--primary-color); color: #ffffff; padding: 20px 40px; text-align: left; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">${component.props.title || 'Page Title'}</h1>
        </header>`;
    case 'TextBlock':
      return `
        <div style="padding: 20px 40px; max-width: 800px; margin: 20px auto;">
          <p style="line-height: 1.6; font-size: 16px;">${component.props.text?.replace(/\n/g, '<br>') || 'This is a text block. You can edit this content in the sidebar.'}</p>
        </div>`;
    case 'Image':
        return `
            <div style="padding: 20px 40px; text-align: center;">
                <img src="${component.props.src || 'https://placehold.co/1200x600.png'}" alt="${component.props.alt || 'Placeholder image'}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" data-ai-hint="website abstract">
            </div>`;
    case 'Form':
      const ssjs = `
<script runat="server">
  Platform.Load("Core","1.1.1");
  var message = "";
  if (Request.Method == "POST") {
    try {
      var email = Request.Form.Get("email");
      var firstName = Request.Form.Get("firstName");
      var lastName = Request.Form.Get("lastName");

      if (!Platform.Function.IsEmpty(email)) {
        /* 
          // Example: Add subscriber to a Data Extension.
          // Replace "Your_Target_DE" with the name of your Data Extension.
          var subscribersDE = DataExtension.Init("Your_Target_DE");
          subscribersDE.Rows.Add({
            EmailAddress: email, 
            FirstName: firstName, 
            LastName: lastName,
            SubscriberKey: email
          }); 
        */
        message = "Thank you for your submission!";
      } else {
        message = "Email address is required.";
      }
    } catch (e) {
      message = "An error occurred during submission.";
      Write(Stringify(e));
    }
  }
</script>`;
      const formHtml = `
<div style="padding: 40px; max-width: 550px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
  <h2 style="margin-top: 0; margin-bottom: 20px; font-size: 22px; color: #333;">${component.props.title || 'Contact Us'}</h2>
  <div style="text-align: center; margin-bottom: 20px; color: var(--accent-color);">
    %%=v(@message)=%%
  </div>
  <form method="post">
    <div style="margin-bottom: 15px;">
      <label for="firstName" style="display: block; margin-bottom: 5px; font-weight: 500; color: #555;">First Name</label>
      <input type="text" id="firstName" name="firstName" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 16px;">
    </div>
    <div style="margin-bottom: 15px;">
      <label for="lastName" style="display: block; margin-bottom: 5px; font-weight: 500; color: #555;">Last Name</label>
      <input type="text" id="lastName" name="lastName" style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 16px;">
    </div>
    <div style="margin-bottom: 20px;">
      <label for="email" style="display: block; margin-bottom: 5px; font-weight: 500; color: #555;">Email Address</label>
      <input type="email" id="email" name="email" required style="width: 100%; padding: 10px; border-radius: 6px; border: 1px solid #ccc; font-size: 16px;">
    </div>
    <button type="submit" style="background-color: var(--accent-color); color: white; width: 100%; padding: 12px 20px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px; font-weight: bold; transition: background-color 0.2s;">
      ${component.props.buttonText || 'Submit'}
    </button>
  </form>
</div>`;
      return `${ssjs}\n${formHtml}`;
    case 'Footer':
      return `
        <footer style="background-color: #2c3e50; color: #bdc3c7; text-align: center; padding: 30px 40px; margin-top: 40px;">
          <p style="margin: 0;">${component.props.text || `© ${new Date().getFullYear()} Your Company. All Rights Reserved.`}</p>
        </footer>`;
    default:
      return `<!-- Unknown component type: ${component.type} -->`;
  }
};

export const generateHtml = (pageState: CloudPage): string => {
  const { styles, components, meta } = pageState;
  const componentsHtml = components.map(renderComponent).join('\n\n');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${meta.title}</title>
  <style>
    :root {
      --background-color: ${styles.backgroundColor};
      --primary-color: ${styles.primaryColor};
      --accent-color: ${styles.accentColor};
      --text-color: ${styles.textColor};
    }
    body {
      margin: 0;
      font-family: ${styles.fontFamily}, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      background-color: var(--background-color);
      color: var(--text-color);
    }
    * {
      box-sizing: border-box;
    }
  </style>
</head>
<body>
  <main>
    ${componentsHtml}
  </main>
</body>
</html>`.trim();
};
