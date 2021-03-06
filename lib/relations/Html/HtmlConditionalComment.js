const HtmlRelation = require('../HtmlRelation');

class HtmlConditionalComment extends HtmlRelation {
  static getRelationsFromNode(node, asset) {
    if (node.nodeType === node.COMMENT_NODE) {
      // <!--[if ...]> .... <![endif]-->
      const matchConditionalComment = node.nodeValue.match(
        /^\[if\s*([^\]]*)\]>([\s\S]*)<!\[endif\]$/
      );
      if (matchConditionalComment) {
        return {
          type: 'HtmlConditionalComment',
          to: {
            type: 'Html',
            sourceUrl: asset.sourceUrl || asset.url,
            text: `<!--ASSETGRAPH DOCUMENT START MARKER-->${matchConditionalComment[2]}<!--ASSETGRAPH DOCUMENT END MARKER-->`,
          },
          node,
          condition: matchConditionalComment[1],
        };
      }
    }
  }

  constructor(config) {
    super(config);
    if (typeof this.condition !== 'string') {
      throw new Error(
        "HtmlConditionalComment constructor: 'condition' config option is mandatory."
      );
    }
  }

  inlineHtmlRelation() {
    let text = this.to.text;
    const matchText = this.to.text.match(
      /<!--ASSETGRAPH DOCUMENT START MARKER-->([\s\S]*)<!--ASSETGRAPH DOCUMENT END MARKER-->/
    );
    if (matchText) {
      text = matchText[1];
    }

    this.node.nodeValue = `[if ${this.condition}]>${text}<![endif]`;
    this.from.markDirty();
  }

  attach(position, adjacentRelation) {
    this.node = this.from.parseTree.createComment('');
    return super.attach(position, adjacentRelation);
  }
}

Object.assign(HtmlConditionalComment.prototype, {
  targetType: 'Html',
  _hrefType: 'inline',
});

module.exports = HtmlConditionalComment;
