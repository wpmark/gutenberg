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

const tableContentSchema = {
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

const tableSchema = {
	table: {
		children: {
			thead: {
				children: tableContentSchema,
			},
			tfoot: {
				children: tableContentSchema,
			},
			tbody: {
				children: tableContentSchema,
			},
		},
	},
};

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
		head: {
			type: 'array',
			default: [],
			source: 'query',
			selector: 'thead tr',
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
		},
		body: {
			type: 'array',
			default: [],
			source: 'query',
			selector: 'tbody tr',
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
		},
		foot: {
			type: 'array',
			default: [],
			source: 'query',
			selector: 'tfoot tr',
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
		},
	},

	supports: {
		align: true,
	},

	transforms: {
		from: [
			{
				type: 'raw',
				selector: 'table',
				schema: tableSchema,
				// transform( node ) {
				// 	const rows = Array.from( node.querySelectorAll( 'tr' ) );

				// 	const block = createBlock( name, {}, rows.map( ( row ) => {
				// 		const cells = Array.from( row.querySelectorAll( 'td,th' ) );

				// 		return createBlock( rowName, {}, cells.map( ( cell ) => {
				// 			const blockAttributes = getBlockAttributes( cellSettings, cell.outerHTML );

				// 			return createBlock( cellName, blockAttributes );
				// 		} ) );
				// 	} ) );

				// 	return block;
				// },
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
