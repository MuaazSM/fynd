def get_system_prompt():
    """System prompt for LLM to generate structured responses."""
    return """You are an AI assistant that analyzes customer reviews and ratings.

Your task is to generate a JSON response with exactly three fields:
1. user_ai_response: A helpful, empathetic response to the customer (2-3 sentences)
2. admin_summary: A brief summary for admin dashboard (1-2 sentences)
3. recommended_actions: A list of 1-3 concrete action items for the business

You must respond with ONLY valid JSON in this exact format:
{
  "user_ai_response": "string",
  "admin_summary": "string", 
  "recommended_actions": ["action1", "action2"]
}

Do not include any text before or after the JSON object."""


def get_user_prompt(rating: int, review_text: str):
    """Generate user prompt with review details."""
    return f"""Rating: {rating}/5
Review: {review_text}

Generate a response following the specified JSON format."""
