export const suggestTagsFromText = (productName, description) => {
    const removeDiacritics = (text) => {
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D');
    };

    const processText = (text) => {
        if (!text) return [];
        var regular_ex = /\p{L}+/gu;
        const tokens = text.match(regular_ex) || [];
        const stopWords = [
            'va', 'hoac', 'nhung', 'boi', 'de', 'la', 'cua', 'tren', 'duoi', 'trong', 'ngoai',
            'cho', 'tu', 'cai', 'nay', 'do', 'mot', 'hai', 'ba', 'bon', 'nam', 'hay', 'thu', 'ta', 'vi', 'neu',
            'phai', 'lam', 'sao', 'du', 'gi', 'ta'
        ];
        return tokens
            .map((word) => removeDiacritics(word.toLowerCase()))
            .filter((word) => word.length > 1 && !stopWords.includes(word));
    };

    const nameTags = processText(productName).map((word) => `#${word}`);
    const descriptionTags = processText(description).map((word) => `#${word}`);

    const combinedTags = [...new Set([...nameTags, ...descriptionTags])];
    return combinedTags;
};

export const convertToTreeData = (list) => {
    return list?.map((item) => ({
        title: item.name,
        value: item.id,
        children: item.children ? convertToTreeData(item.children) : null,
    }));
};