"""Build text prompts for garment generation (FashionSD-X style)."""

TEMPLATES: dict[str, str] = {
    "shirt": "{style} shirt, fashion garment, product photo, white background",
    "pants": "{style} pants, fashion garment, product photo, white background",
    "hat": "{style} hat, fashion accessory, product photo, white background",
    "dress": "{style} dress, fashion garment, product photo, white background",
    "jacket": "{style} jacket, fashion garment, product photo, white background",
}

CATEGORY_DEFAULTS: dict[str, str] = {
    "shirt": "a stylish",
    "pants": "a pair of stylish",
    "hat": "a stylish",
    "dress": "a beautiful",
    "jacket": "a stylish",
}


def build_prompt(category: str, style: str = "") -> str:
    template = TEMPLATES.get(category, TEMPLATES["shirt"])
    style_text = style.strip() if style.strip() else CATEGORY_DEFAULTS.get(category, "a stylish")
    return template.format(style=style_text)
