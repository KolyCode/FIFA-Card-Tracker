import csv
import os
from django.core.management.base import BaseCommand
from backend_api.models import Player

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))

PLAYERS_CSV = os.path.join(BASE_DIR, 'src', 'wc_players_with_ids.csv')
STICKERS_CSV = os.path.join(BASE_DIR, 'OLD RESOURCES', 'Old Spreadsheets', 'wc_stickers_with_ids_and_stickers.csv')


class Command(BaseCommand):
    help = 'Load players from CSV files into the database'

    def handle(self, *args, **options):
        # Build sticker number lookup: sofifa_id -> sticker_id
        sticker_map = {}
        with open(STICKERS_CSV, newline='', encoding='utf-8') as f:
            for row in csv.DictReader(f):
                try:
                    sticker_map[int(row['sofifa_id'])] = row['sticker_id']
                except (ValueError, KeyError):
                    pass

        # Load all players
        created = 0
        skipped = 0
        with open(PLAYERS_CSV, newline='', encoding='utf-8') as f:
            for row in csv.DictReader(f):
                try:
                    player_id = int(row['sofifa_id'])
                except ValueError:
                    skipped += 1
                    continue

                _, was_created = Player.objects.update_or_create(
                    id=player_id,
                    defaults={
                        'player_name': row.get('player_name', ''),
                        'team': row.get('team', ''),
                        'position': row.get('position', ''),
                        'birth_year': int(row['birth_year']) if row.get('birth_year') else None,
                        'sticker_number': sticker_map.get(player_id, ''),
                    }
                )
                if was_created:
                    created += 1
                else:
                    skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f'Done. {created} players created, {skipped} updated/skipped.'
        ))
