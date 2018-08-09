/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { getPhrasingContentSchema } from '@wordpress/blocks';
import { RichText } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './editor.scss';
import './style.scss';
import './theme.scss';
import edit from './edit';

const tableContentPasteSchema = {
	tr: {
		children: {
			th: {
				children: getPhrasingContentSchema(),
			},
			td: {
				children: getPhrasingContentSchema(),
			},
		},
	},
};

const tablePasteSchema = {
	table: {
		children: {
			thead: {
				children: tableContentPasteSchema,
			},
			tfoot: {
				children: tableContentPasteSchema,
			},
			tbody: {
				children: tableContentPasteSchema,
			},
		},
	},
};

function getTablePartAttributeSchema( part ) {
	return {
		type: 'array',
		default: [],
		source: 'query',
		selector: `t${ part } tr`,
		query: {
			cells: {
				type: 'array',
				default: [],
				source: 'query',
				selector: 'td,th',
				query: {
					content: {
						type: 'object',
						source: 'rich-text',
					},
				},
			},
		},
	};
}

export const name = 'core/table';

export const settings = {
	title: __( 'Table' ),
	description: __( 'Insert a table -- perfect for sharing charts and data.' ),
	icon: 'editor-table',
	category: 'formatting',

	attributes: {
		hasFixedLayout: {
			type: 'boolean',
			default: false,
		},
		head: getTablePartAttributeSchema( 'head' ),
		body: getTablePartAttributeSchema( 'body' ),
		foot: getTablePartAttributeSchema( 'foot' ),
	},

	supports: {
		align: true,
	},

	transforms: {
		from: [
			{
				type: 'raw',
				selector: 'table',
				schema: tablePasteSchema,
			},
		],
	},

	edit,

	save( { attributes } ) {
		const { hasFixedLayout, head, body, foot } = attributes;
		const classes = classnames( {
			'has-fixed-layout': hasFixedLayout,
		} );

		const Part = ( { type, rows } ) => {
			if ( ! rows.length ) {
				return null;
			}

			const Tag = `t${ type }`;

			return (
				<Tag>
					{ rows.map( ( { cells }, rowIndex ) =>
						<tr key={ rowIndex }>
							{ cells.map( ( { content }, cellIndex ) =>
								<RichText.Content tagName="td" value={ content } key={ cellIndex } />
							) }
						</tr>
					) }
				</Tag>
			);
		};

		return (
			<table className={ classes }>
				<Part type="head" rows={ head } />
				<Part type="body" rows={ body } />
				<Part type="foot" rows={ foot } />
			</table>
		);
	},
};
