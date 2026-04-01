export async function getDiseaseBaseline(disease: string) {
  const resourceIds: Record<string, string> = {
    dengue: '6d6b3a0d-a96e-4a98-a678-e29f3e4d8deb',
    malaria: '9ef84268-d588-465a-a308-a864a43d0070',
  }
  const id = resourceIds[disease.toLowerCase()]
  if (!id) return []
  const res = await fetch(
    `https://api.data.gov.in/resource/${id}?api-key=579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b&format=json&limit=50`
  )
  const data = await res.json()
  return data.records || []
}
