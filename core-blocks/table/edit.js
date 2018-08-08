/**
 * External dependencies
 */
import classnames from 'classnames';
import { times } from 'lodash';

/**
 * WordPress dependencies
 */
import { Fragment, Component } from '@wordpress/element';
import { InspectorControls, RichText } from '@wordpress/editor';
import { PanelBody, ToggleControl, TextControl, Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

export default class extends Component {
	constructor() {
		super( ...arguments );

		this.onCreateTable = this.onCreateTable.bind( this );
		this.onChangeFixedLayout = this.onChangeFixedLayout.bind( this );
		this.createOnChange = this.createOnChange.bind( this );
		this.onChangeInitialColumnCount = this.onChangeInitialColumnCount.bind( this );
		this.onChangeInitialRowCount = this.onChangeInitialRowCount.bind( this );
		this.renderPart = this.renderPart.bind( this );

		this.state = {
			initialRowCount: 2,
			initialColumnCount: 2,
		};
	}

	onCreateTable() {
		const { setAttributes } = this.props;
		const { initialRowCount, initialColumnCount } = this.state;

		setAttributes( {
			body: times( initialRowCount, () => ( {
				cells: times( initialColumnCount, () => ( {
					content: {
						formats: [],
						text: '',
					},
				} ) ),
			} ) ),
		} );
	}

	onChangeFixedLayout() {
		const { attributes, setAttributes } = this.props;
		const { hasFixedLayout } = attributes;

		setAttributes( { hasFixedLayout: ! hasFixedLayout } );
	}

	createOnChange( { part, rowIndex, cellIndex } ) {
		const { attributes, setAttributes } = this.props;

		return ( content ) => {
			setAttributes( {
				[ part ]: attributes[ part ].map( ( row, i ) => {
					if ( i !== rowIndex ) {
						return row;
					}

					return {
						cells: row.cells.map( ( cell, ii ) => {
							if ( ii !== cellIndex ) {
								return cell;
							}

							return { content };
						} ),
					};
				} ),
			} );
		};
	}

	onChangeInitialColumnCount( initialColumnCount ) {
		this.setState( { initialColumnCount } );
	}

	onChangeInitialRowCount( initialRowCount ) {
		this.setState( { initialRowCount } );
	}

	renderPart( { type, rows } ) {
		if ( ! rows.length ) {
			return null;
		}

		const Tag = `t${ type }`;

		return (
			<Tag>
				{ rows.map( ( { cells }, rowIndex ) =>
					<tr key={ rowIndex }>
						{ cells.map( ( { content }, cellIndex ) =>
							<td key={ cellIndex }>
								<RichText
									value={ content }
									onChange={ this.createOnChange( {
										part: type,
										rowIndex,
										cellIndex,
									} ) }
									placeholder={ __( 'Add cell content' ) }
								/>
							</td>
						) }
					</tr>
				) }
			</Tag>
		);
	}

	render() {
		const { attributes, className } = this.props;
		const { initialRowCount, initialColumnCount } = this.state;
		const { hasFixedLayout, head, body, foot } = attributes;
		const isEmpty = ! head.length && ! body.length && ! foot.length;
		const Part = this.renderPart;

		if ( isEmpty ) {
			return (
				<Fragment>
					<TextControl
						type="number"
						label={ __( 'Column Count' ) }
						value={ initialColumnCount }
						onChange={ this.onChangeInitialColumnCount }
					/>
					<TextControl
						type="number"
						label={ __( 'Row Count' ) }
						value={ initialRowCount }
						onChange={ this.onChangeInitialRowCount }
					/>
					<Button isPrimary onClick={ this.onCreateTable }>Create</Button>
				</Fragment>
			);
		}

		const classes = classnames( className, {
			'has-fixed-layout': hasFixedLayout,
		} );

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Table Settings' ) } className="blocks-table-settings">
						<ToggleControl
							label={ __( 'Fixed width table cells' ) }
							checked={ !! hasFixedLayout }
							onChange={ this.onChangeFixedLayout }
						/>
					</PanelBody>
				</InspectorControls>
				<table className={ classes }>
					<Part type="head" rows={ head } />
					<Part type="body" rows={ body } />
					<Part type="foot" rows={ foot } />
				</table>
			</Fragment>
		);
	}
}
