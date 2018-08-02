/**
 * WordPress dependencies
 */
import { __ } from '@wordpress/i18n';
import { Component } from '@wordpress/element';
import {
	Fill,
	IconButton,
	ToggleControl,
	Toolbar,
	withSpokenMessages,
	Popover,
	ExternalLink,
} from '@wordpress/components';
import { ESCAPE, LEFT, RIGHT, UP, DOWN, BACKSPACE, ENTER, displayShortcut } from '@wordpress/keycodes';
import { prependHTTP } from '@wordpress/url';

/**
 * Internal dependencies
 */
import PositionedAtSelection from './positioned-at-selection';
import URLInput from '../../url-input';
import { filterURLForDisplay } from '../../../utils/url';

const FORMATTING_CONTROLS = [
	{
		icon: 'editor-bold',
		title: __( 'Bold' ),
		shortcut: displayShortcut.primary( 'b' ),
		format: 'bold',
		selector: 'strong',
	},
	{
		icon: 'editor-italic',
		title: __( 'Italic' ),
		shortcut: displayShortcut.primary( 'i' ),
		format: 'italic',
		selector: 'em',
	},
	{
		icon: 'editor-strikethrough',
		title: __( 'Strikethrough' ),
		shortcut: displayShortcut.access( 'd' ),
		format: 'strikethrough',
		selector: 'del',
	},
	{
		icon: 'admin-links',
		title: __( 'Link' ),
		shortcut: displayShortcut.primary( 'k' ),
		format: 'link',
		selector: 'a',
	},
];

// Default controls shown if no `enabledControls` prop provided
const DEFAULT_CONTROLS = [ 'bold', 'italic', 'strikethrough', 'link' ];

// Stop the key event from propagating up to maybeStartTyping in BlockListBlock
const stopKeyPropagation = ( event ) => event.stopPropagation();

/**
 * Returns the Format Toolbar state given a set of props.
 *
 * @param {Object} props Component props.
 *
 * @return {Object} State object.
 */
function computeDerivedState( props ) {
	return {
		selectedNodeId: props.selectedNodeId,
		settingsVisible: false,
		opensInNewWindow: !! props.formats.link && !! props.formats.link.target,
		linkValue: '',
	};
}

class FormatToolbar extends Component {
	constructor() {
		super( ...arguments );
		this.state = {};

		this.addLink = this.addLink.bind( this );
		this.editLink = this.editLink.bind( this );
		this.dropLink = this.dropLink.bind( this );
		this.submitLink = this.submitLink.bind( this );
		this.onKeyDown = this.onKeyDown.bind( this );
		this.onChangeLinkValue = this.onChangeLinkValue.bind( this );
		this.toggleLinkSettingsVisibility = this.toggleLinkSettingsVisibility.bind( this );
		this.setLinkTarget = this.setLinkTarget.bind( this );
	}

	onKeyDown( event ) {
		if ( event.keyCode === ESCAPE ) {
			event.stopPropagation();
			this.dropLink();
		}

		if ( [ LEFT, DOWN, RIGHT, UP, BACKSPACE, ENTER ].indexOf( event.keyCode ) > -1 ) {
			stopKeyPropagation( event );
		}
	}

	static getDerivedStateFromProps( props, state ) {
		if ( state.selectedNodeId !== props.selectedNodeId ) {
			return computeDerivedState( props );
		}

		return null;
	}

	onChangeLinkValue( value ) {
		this.setState( { linkValue: value } );
	}

	toggleLinkSettingsVisibility() {
		this.setState( ( state ) => ( { settingsVisible: ! state.settingsVisible } ) );
	}

	setLinkTarget( opensInNewWindow ) {
		this.setState( { opensInNewWindow } );
		if ( this.props.formats.link && ! this.props.formats.link.isAdding ) {
			this.props.onChange( { link: {
				value: this.props.formats.link.value,
				target: opensInNewWindow ? '_blank' : null,
				rel: opensInNewWindow ? 'noreferrer noopener' : null,
			} } );
		}

		this.props.applyFormat( format );

		const format = this.props.getActiveFormat( 'a' );

		if ( opensInNewWindow ) {
			format.attributes.target = '_blank';
			format.attributes.rel = 'noreferrer noopener';
		}

		this.props.applyFormat( format );
	}

	addLink() {
		this.setState( { linkValue: '' } );
		this.props.applyFormat( {
			type: 'a',
			attributes: {
				href: '',
			},
		} );
	}

	dropLink() {
		this.setState( { linkValue: '' } );
		this.props.removeFormat( 'a' );
	}

	editLink( event ) {
		const format = this.props.getActiveFormat( 'a' );

		this.setState( { linkValue: format.attributes.href, isEditing: true } );
		event.preventDefault();
	}

	submitLink( event ) {
		const { linkValue, opensInNewWindow } = this.state;
		const href = prependHTTP( linkValue );
		const format = {
			type: 'a',
			attributes: {
				href,
			},
		};

		if ( opensInNewWindow ) {
			format.attributes.target = '_blank';
			format.attributes.rel = 'noreferrer noopener';
		}

		this.props.applyFormat( format );

		this.setState( { linkValue: href } );

		// if ( ! this.props.formats.link.value ) {
		// 	this.props.speak( __( 'Link added.' ), 'assertive' );
		// }

		event.preventDefault();
	}

	render() {
		const { enabledControls = DEFAULT_CONTROLS, customControls = [], selectedNodeId } = this.props;
		const { linkValue, settingsVisible, opensInNewWindow, isEditing } = this.state;
		const link = this.props.getActiveFormat( 'a' );

		const isEditingLink = isEditing || ( link && ( ! link.attributes || ! link.attributes.href ) );

		const toolbarControls = FORMATTING_CONTROLS.concat( customControls )
			.filter( ( control ) => enabledControls.indexOf( control.format ) !== -1 )
			.map( ( control ) => {
				if ( control.format === 'link' ) {
					return {
						...control,
						icon: link ? 'editor-unlink' : 'admin-links', // TODO: Need proper unlink icon
						title: link ? __( 'Unlink' ) : __( 'Link' ),
						onClick: link ? this.dropLink : this.addLink,
						isActive: !! link,
					};
				}

				return {
					...control,
					onClick: () => this.props.toggleFormat( { type: control.selector } ),
					isActive: !! this.props.getActiveFormat( control.selector ),
				};
			} );

		const linkSettings = settingsVisible && (
			<div className="editor-format-toolbar__link-modal-line editor-format-toolbar__link-settings">
				<ToggleControl
					label={ __( 'Open in New Window' ) }
					checked={ opensInNewWindow }
					onChange={ this.setLinkTarget } />
			</div>
		);

		return (
			<div className="editor-format-toolbar">
				<Toolbar controls={ toolbarControls } />

				{ link && (
					<Fill name="RichText.Siblings">
						<PositionedAtSelection className="editor-format-toolbar__link-container">
							<Popover
								position="bottom center"
								focusOnMount={ isEditingLink ? 'firstElement' : false }
								key={ selectedNodeId /* Used to force rerender on change */ }
							>
								{ isEditingLink && (
								// Disable reason: KeyPress must be suppressed so the block doesn't hide the toolbar
								/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
									<form
										className="editor-format-toolbar__link-modal"
										onKeyPress={ stopKeyPropagation }
										onKeyDown={ this.onKeyDown }
										onSubmit={ this.submitLink }>
										<div className="editor-format-toolbar__link-modal-line">
											<URLInput value={ linkValue } onChange={ this.onChangeLinkValue } />
											<IconButton icon="editor-break" label={ __( 'Apply' ) } type="submit" />
											<IconButton
												className="editor-format-toolbar__link-settings-toggle"
												icon="ellipsis"
												label={ __( 'Link Settings' ) }
												onClick={ this.toggleLinkSettingsVisibility }
												aria-expanded={ settingsVisible }
											/>
										</div>
										{ linkSettings }
									</form>
								/* eslint-enable jsx-a11y/no-noninteractive-element-interactions */
								) }

								{ ! isEditingLink && (
								// Disable reason: KeyPress must be suppressed so the block doesn't hide the toolbar
								/* eslint-disable jsx-a11y/no-static-element-interactions */
									<div
										className="editor-format-toolbar__link-modal"
										onKeyPress={ stopKeyPropagation }
									>
										<div className="editor-format-toolbar__link-modal-line">
											<ExternalLink
												className="editor-format-toolbar__link-value"
												href={ link.attributes.href }
											>
												{ link.attributes.href && filterURLForDisplay( decodeURI( link.attributes.href ) ) }
											</ExternalLink>
											<IconButton icon="edit" label={ __( 'Edit' ) } onClick={ this.editLink } />
											<IconButton
												className="editor-format-toolbar__link-settings-toggle"
												icon="ellipsis"
												label={ __( 'Link Settings' ) }
												onClick={ this.toggleLinkSettingsVisibility }
												aria-expanded={ settingsVisible }
											/>
										</div>
										{ linkSettings }
									</div>
								/* eslint-enable jsx-a11y/no-static-element-interactions */
								) }
							</Popover>
						</PositionedAtSelection>
					</Fill>
				) }
			</div>
		);
	}
}

export default withSpokenMessages( FormatToolbar );
