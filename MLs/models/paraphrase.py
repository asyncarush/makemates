from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

model_name = "alykassem/FLAN-T5-Paraphraser"  

# Load the tokenizer
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Load the model
model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

def get_suggestions_from_model(user_caption_input):
    suggestions = []

    # Example usage: Tokenize input and generate output
    input_text = f"Paraphrase:${user_caption_input}"

    inputs = tokenizer(input_text, return_tensors="pt")

    # Generate multiple responses
    outputs = model.generate(
        **inputs,
        num_return_sequences=5,     # Increased number of suggestions
        num_beams=7,               # More beams for better variety
        max_length=50,             # Maximum length of generated text
        do_sample=True,            # Enable sampling
        temperature=0.9,           # Increased temperature for more creative outputs
        top_k=100,                 # Increased top_k for more variety
        top_p=0.95,               # Top P sampling
        no_repeat_ngram_size=2     # Prevents repetition of phrases
    )

    for output in outputs:
        decoded_output = tokenizer.decode(output, skip_special_tokens=True)
        suggestions.append(decoded_output)

    return suggestions
