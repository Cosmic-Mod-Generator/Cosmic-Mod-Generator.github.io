import { useLocale } from '../contexts/index.js'
import { Octicon } from './index.js'

interface Props {
	donate?: boolean,
}
export function Footer({ }: Props) {
	const { locale } = useLocale()

	return <footer>
		<p>
			<span>{locale('developed_by')} <a href="https://github.com/Cosmic-Mod/" target="_blank" rel="noreferrer">Cosmic Horizons Team</a>, forked from <a href="https://github.com/misode" target="_blank" rel="noreferrer">Misode</a></span>
		</p>
		<p>
			{Octicon.mark_github}
			<span>{locale('source_code_on')} <a href="https://github.com/Cosmic-Mod-Generator/Cosmic-Mod-Generator.github.io" target="_blank" rel="noreferrer">{locale('github')}</a></span>
		</p>
	</footer>
}
