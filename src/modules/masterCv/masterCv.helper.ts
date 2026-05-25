import { aiClient } from "../../infrastructure/ai/aiClient"
import { AI_ENDPOINTS } from "../../infrastructure/ai/aiEndpoints"


interface IEnhancePayload {
  userId: string
  situation: string
  task: string
  action: string
  result: string
}

export const enhanceChallenge = async ({
  userId,
  situation,
  task,
  action,
  result
}: IEnhancePayload) => {
  const { data } = await aiClient.post(
    AI_ENDPOINTS.MASTER_CV.ENHANCE_CHALLANGE,
    {
      userId,
      situation,
      task,
      action,
      result
    }
  )
  return data
}
