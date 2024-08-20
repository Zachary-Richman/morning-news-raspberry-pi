# AI Powered News

How does this work? step-by-step :open_mouth:
- First we have a typescript powered web server that gets news results as urls
- We then use googles `puppeteer` to convert to a pdf <sup>1</sup>.
- The PDFs are then proccesed and turned into text objects
- The text objects are then hosted by our webserver at our `api/<query>` route
- We can then make a vocal prompt for our Raspberry PI Powered LLM to the web server.
- Our Raspberry PI Powered LLM then fetches that text, proccesses it and generates a response.
- We can prompt for further questions or request a new prompt.

- OPTIONAL: GPIO Integrations for an added layer of fun.
