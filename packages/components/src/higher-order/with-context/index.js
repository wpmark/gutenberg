/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { createHigherOrderComponent } from '@wordpress/compose';

export default ( contextName ) => ( mapSettingsToProps ) => createHigherOrderComponent(
	( OriginalComponent ) => {
		class WrappedComponent extends Component {
			render() {
				const extraProps = mapSettingsToProps ?
					mapSettingsToProps( this.context[ contextName ], this.props ) :
					{ [ contextName ]: this.context[ contextName ] };

				return (
					<OriginalComponent
						{ ...this.props }
						{ ...extraProps }
					/>
				);
			}
		}

		WrappedComponent.contextTypes = {
			[ contextName ]: noop,
		};

		return WrappedComponent;
	},
	'withContext'
);
