const fs = require('fs/promises')
const validate = require('jsonschema').validate

;(async () => {
  const files = await fs.readdir('./data')
  const schema = JSON.parse(await fs.readFile('./public/schema.json', 'utf-8'))
  const result: unknown[] = []
  for (const file of files) {
    const text = await fs.readFile(`./data/${file}`, 'utf-8')
    const data = JSON.parse(text)
    const validated = validate(data, schema)
    if (validated.errors.length > 0) throw new Error(validated.errors[0])
    result.push({
      ...data,
      slug: file.replace('.json', ''),
    })

    await fs.mkdir(
      `./src/app/[state]/[city]/(entries)/(data)/${file.replace('.json', '')}`,
      { recursive: true },
    )
    await fs.writeFile(
      `./src/app/[state]/[city]/(entries)/(data)/${file.replace(
        '.json',
        '',
      )}/page.tsx`,
      `import { type Metadata } from 'next';
import { CollectionPage } from "@/app/[state]/[city]/(entries)/component";

export const metadata: Metadata = {
  title: "${data.name}",
  description: "${data.name} (${
    data.tagline
  }) is part of Made with Love in India, a movement to celebrate, promote, and build a brand, India."
};

const data = JSON.parse(\`${JSON.stringify(data)}\`);

export default function Page() {
  return <CollectionPage data={data} />
}
`,
    )
  }
  await fs.mkdir('./src/generated', { recursive: true })
  await fs.writeFile(
    './src/generated/data.json',
    JSON.stringify(result, null, 2),
  )
})()
