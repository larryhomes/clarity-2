import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

interface OutputFormat {
  [key: string]: string | string[] | OutputFormat;
}

export async function strict_output(
  system_prompt: string,
  user_prompt: string | string[],
  output_format: OutputFormat,
  default_category: string = "",
  output_value_only: boolean = false,
  model: string = "gpt-3.5-turbo",
  temperature: number = 1,
  num_tries: number = 3,
  verbose: boolean = false
): Promise<
  {
    question: string;
    answer: string;
  }[]
> {
  // se l'input utente è in una lista, processiamo anche l'output come lista di json
  const list_input: boolean = Array.isArray(user_prompt);
  // se il formato di output contiene elementi dinamici di < o >, aggiungiamo al prompt per gestire gli elementi dinamici
  const dynamic_elements: boolean = /<.*?>/.test(JSON.stringify(output_format));
  // se il formato di output contiene elementi di lista di [ o ], allora aggiungiamo al prompt per gestire le liste
  const list_output: boolean = /\[.*?\]/.test(JSON.stringify(output_format));

  // iniziare senza messaggi di errore
  let error_msg: string = "";

  for (let i = 0; i < num_tries; i++) {
    let output_format_prompt: string = `\nDevi produrre il seguente formato in json: ${JSON.stringify(
      output_format
    )}. \nNon inserire virgolette o caratteri di escape \\ nei campi di output.`;

    if (list_output) {
      output_format_prompt += `\nSe il campo di output è una lista, classifica l'output nell'elemento migliore della lista.`;
    }

    // se il formato di output contiene elementi dinamici, elaboralo di conseguenza
    if (dynamic_elements) {
      output_format_prompt += `\nOgni testo racchiuso tra < e > indica che devi generare contenuto per sostituirlo. Esempio di input: Vai a <luogo>, Esempio di output: Vai al giardino\nOgni chiave di output che contiene < e > indica che devi generare il nome della chiave per sostituirla. Esempio di input: {'<luogo>': 'descrizione del luogo'}, Esempio di output: {scuola: un posto per l'educazione}`;
    }

    // se l'input è in formato lista, chiedi di generare json in una lista
    if (list_input) {
      output_format_prompt += `\nGenera una lista di json, un json per ogni elemento di input.`;
    }

    // Usa OpenAI per ottenere una risposta
    const response = await openai.createChatCompletion({
      temperature: temperature,
      model: model,
      messages: [
        {
          role: "system",
          content: system_prompt + output_format_prompt + error_msg,
        },
        { role: "user", content: user_prompt.toString() },
      ],
    });

    let res: string =
      response.data.choices[0].message?.content?.replace(/'/g, '"') ?? "";

    // assicurarsi di non sostituire via gli apostrofi nel testo
    res = res.replace(/(\w)"(\w)/g, "$1'$2");

    if (verbose) {
      console.log(
        "Prompt di sistema:",
        system_prompt + output_format_prompt + error_msg
      );
      console.log("\nPrompt utente:", user_prompt);
      console.log("\nRisposta GPT:", res);
    }

    // blocco try-catch per assicurare l'aderenza al formato di output
    try {
      let output: any = JSON.parse(res);

      if (list_input) {
        if (!Array.isArray(output)) {
          throw new Error("Formato di output non in una lista di json");
        }
      } else {
        output = [output];
      }

      // controllare per ogni elemento nell'output_list, il formato è correttamente seguito
      for (let index = 0; index < output.length; index++) {
        for (const key in output_format) {
          // impossibile assicurare l'accuratezza dell'intestazione dinamica dell'output, quindi la saltiamo
          if (/<.*?>/.test(key)) {
            continue;
          }

          // se manca un campo di output, solleva un errore
          if (!(key in output[index])) {
            throw new Error(`${key} non presente nell'output json`);
          }

          // controllare che una delle scelte date per la lista di parole sia sconosciuta
          if (Array.isArray(output_format[key])) {
            const choices = output_format[key] as string[];
            // assicurare che l'output non sia una lista
            if (Array.isArray(output[index][key])) {
              output[index][key] = output[index][key][0];
            }
            // se l'output è un formato descrittivo, ottieni solo l'etichetta
            if (output[index][key].includes(":")) {
              output[index][key] = output[index][key].split(":")[0];
            }
          }
        }

        // se vogliamo solo i valori per gli output
        if (output_value_only) {
          output[index] = Object.values(output[index]);
          // solo output senza la lista se c'è un solo elemento
          if (output[index].length === 1) {
            output[index] = output[index][0];
          }
        }
      }

      return list_input ? output : output[0];
    } catch (e) {
      error_msg = `\n\nRisultato: ${res}\n\nMessaggio di errore: ${e}`;
      console.log("Si è verificato un'eccezione:", e);
      console.log("Formato json corrente non valido:", res);
    }
  }

  return [];
}

